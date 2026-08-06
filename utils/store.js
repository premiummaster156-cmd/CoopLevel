const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "store.json");
let memory = { users: {}, settings: {}, cooldowns: {} };

function load() {
  try { if (fs.existsSync(FILE)) memory = { ...memory, ...JSON.parse(fs.readFileSync(FILE, "utf8")) }; } catch (err) {}
}
function save() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(memory, null, 2)); } catch (err) {}
}
load();

function xpForLevel(level) { return 5 * level * level + 50 * level + 100; }
function levelFromXp(xp) {
  let level = 0;
  let remaining = xp;
  while (remaining >= xpForLevel(level + 1)) { remaining -= xpForLevel(level + 1); level++; }
  return { level, currentXp: remaining, needed: xpForLevel(level + 1) };
}

module.exports = {
  xpForLevel,
  levelFromXp,
  getUser(guildId, userId) {
    if (!memory.users[guildId]) memory.users[guildId] = {};
    if (!memory.users[guildId][userId]) memory.users[guildId][userId] = { xp: 0, level: 0, messages: 0 };
    return memory.users[guildId][userId];
  },
  addXp(guildId, userId, amount) {
    const u = this.getUser(guildId, userId);
    u.xp += amount;
    u.messages += 1;
    const info = levelFromXp(u.xp);
    const leveledUp = info.level > u.level;
    u.level = info.level;
    save();
    return { user: u, leveledUp, current: info };
  },
  setXp(guildId, userId, xp) {
    const u = this.getUser(guildId, userId);
    u.xp = xp;
    const info = levelFromXp(xp);
    u.level = info.level;
    save();
    return { user: u, current: info };
  },
  resetUser(guildId, userId) {
    if (memory.users[guildId]) delete memory.users[guildId][userId];
    save();
  },
  resetAll(guildId) {
    if (memory.users[guildId]) memory.users[guildId] = {};
    save();
  },
  getLeaderboard(guildId, limit = 10) {
    const g = memory.users[guildId] || {};
    return Object.entries(g).map(([userId, u]) => ({ userId, xp: u.xp, level: u.level })).sort((a, b) => b.xp - a.xp).slice(0, limit);
  },
  getSettings(guildId) { return memory.settings[guildId] || {}; },
  setSetting(guildId, key, value) {
    if (!memory.settings[guildId]) memory.settings[guildId] = {};
    memory.settings[guildId][key] = value;
    save();
  },
  canGainXp(guildId, userId) {
    const now = Date.now();
    if (memory.cooldowns[guildId] && memory.cooldowns[guildId][userId] && now - memory.cooldowns[guildId][userId] < 60000) return false;
    if (!memory.cooldowns[guildId]) memory.cooldowns[guildId] = {};
    memory.cooldowns[guildId][userId] = now;
    save();
    return true;
  },
};
