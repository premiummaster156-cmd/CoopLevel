const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  { name: "rank", description: "Check your rank (prefix). Usage: -*-prefix*-rank [@user]", async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const u = store.getUser(message.guild.id, user.id);
    const info = store.levelFromXp(u.xp);
    const top = store.getLeaderboard(message.guild.id, 100);
    const rank = top.findIndex((e) => e.userId === user.id) + 1 || "—";
    await message.channel.send({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).addFields(
      { name: "Level", value: `**${u.level}**`, inline: true },
      { name: "XP", value: `${u.xp.toLocaleString()}`, inline: true },
      { name: "Rank", value: `#${rank}`, inline: true },
      { name: "Messages", value: `${u.messages}`, inline: true },
      { name: "Progress", value: `${info.currentXp}/${info.needed}`, inline: true },
    ).setThumbnail(user.displayAvatarURL())] });
  } },
  { name: "level", description: "Check level (prefix). Usage: -*-prefix*-level [@user]", async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const u = store.getUser(message.guild.id, user.id);
    await message.channel.send({ embeds: [info("Level", `**${user.tag}** is **Level ${u.level}** with **${u.xp.toLocaleString()} XP**.`)] });
  } },
  { name: "leaderboard", aliases: ["lb", "top"], description: "Leaderboard (prefix).", async execute(message) {
    const top = store.getLeaderboard(message.guild.id, 10);
    if (top.length === 0) return message.reply({ embeds: [error("Empty", "No data yet.")] });
    const text = top.map((e, i) => `**${i + 1}.** <@${e.userId}> — Level **${e.level}** (${e.xp.toLocaleString()} XP)`).join("\n");
    await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🏆 Leaderboard").setColor(config.colors.primary).setDescription(text)] });
  } },
  { name: "xp", description: "Check XP (prefix). Usage: -*-prefix*-xp [@user]", async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const u = store.getUser(message.guild.id, user.id);
    const info = store.levelFromXp(u.xp);
    await message.channel.send({ embeds: [info("XP", `**${user.tag}** has **${u.xp.toLocaleString()} XP**.\n${info.currentXp}/${info.needed} to next level.`)] });
  } },
  { name: "progress", description: "Your progress (prefix).", async execute(message) {
    const u = store.getUser(message.guild.id, message.author.id);
    const info = store.levelFromXp(u.xp);
    const pct = Math.floor((info.currentXp / info.needed) * 100);
    const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    await message.channel.send({ embeds: [info("Progress", `Level ${u.level} → ${u.level + 1}\n${bar} **${pct}%**\n${info.currentXp}/${info.needed} XP`)] });
  } },
  { name: "nextlevel", description: "XP to next level (prefix).", async execute(message) {
    const u = store.getUser(message.guild.id, message.author.id);
    const info = store.levelFromXp(u.xp);
    await message.channel.send({ embeds: [info("Next Level", `You need **${info.needed - info.currentXp} XP** more for Level **${u.level + 1}**.`)] });
  } },
  { name: "stats", description: "Server stats (prefix).", async execute(message) {
    const top = store.getLeaderboard(message.guild.id, 100);
    const totalXp = top.reduce((s, e) => s + e.xp, 0);
    await message.channel.send({ embeds: [info("Server Stats", `Users: **${top.length}**\nTotal XP: **${totalXp.toLocaleString()}**\nTop: ${top[0] ? `<@${top[0].userId}>` : "None"}`)] });
  } },
  { name: "setxp", description: "Set XP (prefix, admin). Usage: -*-prefix*-setxp @user <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const user = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    if (!user || !amount) return message.reply({ embeds: [error("Usage", "Mention user and amount.")] });
    store.setXp(message.guild.id, user.id, amount);
    await message.channel.send({ embeds: [success("XP Set", `Set **${user.tag}**'s XP to **${amount}**.`)] });
  } },
  { name: "addxp", description: "Add XP (prefix, admin). Usage: -*-prefix*-addxp @user <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const user = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    if (!user || !amount) return message.reply({ embeds: [error("Usage", "Mention user and amount.")] });
    const u = store.getUser(message.guild.id, user.id);
    store.setXp(message.guild.id, user.id, u.xp + amount);
    await message.channel.send({ embeds: [success("XP Added", `Added **${amount} XP** to **${user.tag}**.`)] });
  } },
  { name: "removexp", description: "Remove XP (prefix, admin). Usage: -*-prefix*-removexp @user <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const user = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    if (!user || !amount) return message.reply({ embeds: [error("Usage", "Mention user and amount.")] });
    const u = store.getUser(message.guild.id, user.id);
    store.setXp(message.guild.id, user.id, Math.max(0, u.xp - amount));
    await message.channel.send({ embeds: [success("XP Removed", `Removed **${amount} XP** from **${user.tag}**.`)] });
  } },
  { name: "resetlevel", description: "Reset a user's level (prefix, admin). Usage: -*-prefix*-resetlevel @user", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const user = message.mentions.users.first();
    if (!user) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    store.resetUser(message.guild.id, user.id);
    await message.channel.send({ embeds: [success("Reset", `Reset **${user.tag}**'s level.`)] });
  } },
  { name: "resetall", description: "Reset all levels (prefix, admin).", async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    store.resetAll(message.guild.id);
    await message.channel.send({ embeds: [warning("Reset All", "All levels reset.")] });
  } },
  { name: "setlevel", description: "Set level (prefix, admin). Usage: -*-prefix*-setlevel @user <level>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const user = message.mentions.users.first();
    const level = parseInt(args[1], 10);
    if (!user || !level) return message.reply({ embeds: [error("Usage", "Mention user and level.")] });
    let xp = 0;
    for (let i = 1; i < level; i++) xp += store.xpForLevel(i);
    store.setXp(message.guild.id, user.id, xp);
    await message.channel.send({ embeds: [success("Level Set", `Set **${user.tag}** to Level **${level}**.`)] });
  } },
  { name: "rewards", description: "View level rewards (prefix).", async execute(message) {
    const rewards = store.getSettings(message.guild.id).rewards || [];
    if (rewards.length === 0) return message.reply({ embeds: [info("Level Rewards", "No rewards configured.")] });
    const text = rewards.map((r) => `Level **${r.level}** → <@&${r.role}>`).join("\n");
    await message.channel.send({ embeds: [info("🎁 Level Rewards", text)] });
  } },
  { name: "addreward", description: "Add level reward (prefix, admin). Usage: -*-prefix*-addreward <level> @role", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const level = parseInt(args[0], 10);
    const role = message.mentions.roles.first();
    if (!level || !role) return message.reply({ embeds: [error("Usage", "Provide level and role.")] });
    const s = store.getSettings(message.guild.id);
    const rewards = s.rewards || [];
    rewards.push({ level, role: role.id });
    store.setSetting(message.guild.id, "rewards", rewards);
    await message.channel.send({ embeds: [success("Reward Added", `Level **${level}** rewards **${role.name}**.`)] });
  } },
  { name: "removereward", description: "Remove level reward (prefix, admin). Usage: -*-prefix*-removereward <level>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const level = parseInt(args[0], 10);
    const s = store.getSettings(message.guild.id);
    store.setSetting(message.guild.id, "rewards", (s.rewards || []).filter((r) => r.level !== level));
    await message.channel.send({ embeds: [success("Reward Removed", `Removed Level **${level}** reward.`)] });
  } },
  { name: "setxppermessage", description: "Set XP per message (prefix, admin). Usage: -*-prefix*-setxppermessage <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const amount = parseInt(args[0], 10);
    store.setSetting(message.guild.id, "xpPerMessage", amount);
    await message.channel.send({ embeds: [success("XP/Msg", `Set to **${amount}**.`)] });
  } },
  { name: "setlevelupchannel", description: "Set level-up channel (prefix, admin). Usage: -*-prefix*-setlevelupchannel #channel", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply({ embeds: [error("Usage", "Mention a channel.")] });
    store.setSetting(message.guild.id, "levelUpChannel", channel.id);
    await message.channel.send({ embeds: [success("Channel Set", `Level-ups go to ${channel}.`)] });
  } },
  { name: "toggleleveling", description: "Toggle leveling (prefix, admin). Usage: -*-prefix*-toggleleveling <on|off>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const enabled = (args[0] || "on").toLowerCase() !== "off";
    store.setSetting(message.guild.id, "enabled", enabled);
    await message.channel.send({ embeds: [success("Leveling", enabled ? "Enabled." : "Disabled.")] });
  } },
  { name: "help", description: "Show help (prefix).", async execute(message) {
    const cmds = message.client.prefixCommands;
    const text = cmds.map((c) => `\`${config.prefix}${c.name}\` — ${c.description.replace(/\*-prefix-\*/g, config.prefix)}`).slice(0, 40).join("\n");
    await message.channel.send({ embeds: [info("CoopLevel Help", text)] });
  } },
  { name: "ping", description: "Pong (prefix).", async execute(message) {
    const now = Date.now();
    const m = await message.channel.send({ embeds: [info("Pinging...")] });
    await m.edit({ embeds: [success("Pong!", `Latency: ${Date.now() - now}ms`)] });
  } },
  { name: "botinfo", description: "Bot info (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🆙 CoopLevel", `Slash: ${message.client.slashCommands.size}\nPrefix: ${message.client.prefixCommands.size}\nServers: ${message.client.guilds.cache.size}`)] });
  } },
  { name: "invite", description: "Invite link (prefix).", async execute(message) {
    await message.channel.send({ embeds: [success("Invite", `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)] });
  } },
  { name: "serverinfo", description: "Server info (prefix).", async execute(message) {
    const g = message.guild;
    await message.channel.send({ embeds: [info(g.name, `Members: **${g.memberCount}**\nOwner: <@${g.ownerId}>`)] });
  } },
  { name: "userinfo", description: "User info (prefix). Usage: -*-prefix*-userinfo [@user]", async execute(message) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [info(user.tag, `**ID:** ${user.id}\n**Created:** ${user.createdAt.toDateString()}`)] });
  } },
  { name: "avatar", description: "Avatar (prefix). Usage: -*-prefix*-avatar [@user]", async execute(message) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).setImage(user.displayAvatarURL({ size: 1024 }))] });
  } },
  { name: "uptime", description: "Uptime (prefix).", async execute(message) {
    const s = Math.floor(message.client.uptime / 1000);
    await message.channel.send({ embeds: [success("Uptime", `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`)] });
  } },
  { name: "clear", description: "Clear messages (prefix). Usage: -*-prefix*-clear <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    const amount = parseInt(args[0], 10);
    await message.channel.bulkDelete(Math.min(amount || 5, 100), true).catch(() => {});
  } },
  { name: "say", description: "Make bot say (prefix). Usage: -*-prefix*-say <text>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    await message.channel.send(args.join(" "));
  } },
  { name: "poll", description: "Create poll (prefix). Usage: -*-prefix*-poll <question>", async execute(message, args) {
    const q = args.join(" ");
    const m = await message.channel.send({ embeds: [info("📊 Poll", q)] });
    await m.react("👍"); await m.react("👎");
  } },
  { name: "announce", description: "Announce (prefix). Usage: -*-prefix*-announce <text>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    await message.channel.send({ embeds: [warning("📢", args.join(" "))] });
  } },
  { name: "coinflip", description: "Flip a coin (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🪙", `You got **${Math.random() < 0.5 ? "Heads" : "Tails"}**!`)] });
  } },
  { name: "dice", description: "Roll a die (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🎲", `You rolled a **${Math.floor(Math.random() * 6) + 1}**!`)] });
  } },
  { name: "joke", description: "Get a joke (prefix).", async execute(message) {
    const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "Why did the level 100 user cry? His XP bar was empty.", "I'm reading a book on anti-gravity. It's impossible to put down!"];
    await message.channel.send({ embeds: [success("😂", rand(jokes))] });
  } },
  { name: "8ball", description: "Ask 8-ball (prefix).", async execute(message, args) {
    const answers = ["Yes!", "No.", "Maybe.", "Ask again later.", "Signs point to yes."];
    await message.channel.send({ embeds: [info("🎱", `**A:** ${rand(answers)}`)] });
  } },
  { name: "rate", description: "Rate something (prefix). Usage: -*-prefix*-rate <thing>", async execute(message, args) {
    await message.channel.send({ embeds: [info("⭐", `**${args.join(" ") || "that"}** is **${Math.floor(Math.random() * 11)}/10**.`)] });
  } },
  { name: "mock", description: "Mock text (prefix). Usage: -*-prefix*-mock <text>", async execute(message, args) {
    const text = args.join(" ").split("").map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join("");
    await message.channel.send({ embeds: [info("😏", text)] });
  } },
  { name: "reverse", description: "Reverse text (prefix). Usage: -*-prefix*-reverse <text>", async execute(message, args) {
    await message.channel.send({ embeds: [info("↩️", args.join(" ").split("").reverse().join(""))] });
  } },
  { name: "clap", description: "Clap text (prefix). Usage: -*-prefix*-clap <text>", async execute(message, args) {
    await message.channel.send({ content: args.join(" ").split(" ").join(" 👏 ") });
  } },
  { name: "fortune", description: "Get fortune (prefix).", async execute(message) {
    const fortunes = ["You will level up soon.", "Great XP gains are coming.", "A high level awaits you."];
    await message.channel.send({ embeds: [info("🔮", rand(fortunes))] });
  } },
  { name: "catfact", description: "Cat fact (prefix).", async execute(message) {
    const facts = ["Cats sleep 70% of their lives.", "Cats can rotate their ears 180 degrees."];
    await message.channel.send({ embeds: [info("🐱", rand(facts))] });
  } },
  { name: "dogfact", description: "Dog fact (prefix).", async execute(message) {
    const facts = ["A dog's nose print is unique.", "Dogs can smell 1000x better than humans."];
    await message.channel.send({ embeds: [info("🐶", rand(facts))] });
  } },
  { name: "meme", description: "Get a meme (prefix).", async execute(message) {
    const memes = ["When you finally level up after weeks", "Grinding XP be like", "My level is my whole personality"];
    await message.channel.send({ embeds: [success("😂", rand(memes))] });
  } },
  { name: "roast", description: "Roast a user (prefix). Usage: -*-prefix*-roast @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const roasts = ["Your level is as low as your effort.", "Even the bot has more XP than you.", "You still haven't reached level 2?"];
    await message.channel.send({ embeds: [warning("🔥", `${target}, ${rand(roasts)}`)] });
  } },
  { name: "hug", description: "Hug a user (prefix). Usage: -*-prefix*-hug @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [success("🤗", `${message.author} hugged ${target}!`)] });
  } },
  { name: "slap", description: "Slap a user (prefix). Usage: -*-prefix*-slap @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [warning("👋", `${message.author} slapped ${target}!`)] });
  } },
  { name: "slowmode", description: "Set slowmode (prefix). Usage: -*-prefix*-slowmode <seconds>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [error("No permission", "Need Manage Channels.")] });
    const s = parseInt(args[0], 10);
    await message.channel.setRateLimitPerUser(s || 0);
    await message.channel.send({ embeds: [success("Slowmode", `Set to **${s || 0}s**.`)] });
  } },
  { name: "ban", description: "Ban a user (prefix). Usage: -*-prefix*-ban @user", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({ embeds: [error("No permission", "Need Ban Members.")] });
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    await message.guild.members.ban(target.id);
    await message.channel.send({ embeds: [warning("Banned", `Banned **${target.tag}**.`)] });
  } },
  { name: "kick", description: "Kick a user (prefix). Usage: -*-prefix*-kick @user", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply({ embeds: [error("No permission", "Need Kick Members.")] });
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    const member = message.guild.members.cache.get(target.id);
    await member.kick();
    await message.channel.send({ embeds: [warning("Kicked", `Kicked **${target.tag}**.`)] });
  } },
  { name: "timeout", description: "Timeout a user (prefix). Usage: -*-prefix*-timeout @user <minutes>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ embeds: [error("No permission", "Need Moderate Members.")] });
    const target = message.mentions.users.first();
    const mins = parseInt(args[1], 10);
    if (!target || !mins) return message.reply({ embeds: [error("Usage", "Mention user and minutes.")] });
    const member = message.guild.members.cache.get(target.id);
    await member.timeout(mins * 60000);
    await message.channel.send({ embeds: [success("Timeout", `Timed out **${target.tag}** for **${mins}** min.`)] });
  } },
];
