const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

module.exports = [
  { category: "level", data: new SlashCommandBuilder().setName("top").setDescription("Top 3 by level."), async execute(interaction) {
    const top = store.getLeaderboard(interaction.guild.id, 3);
    if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No data yet.")] });
    const medals = ["🥇", "🥈", "🥉"];
    const text = top.map((e, i) => `${medals[i] || "🏅"} <@${e.userId}> — Level **${e.level}**`).join("\n");
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle("🏅 Top Levels").setColor(config.colors.primary).setDescription(text)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("rankings").setDescription("View rankings.").addIntegerOption((o) => o.setName("page").setDescription("Page")), async execute(interaction) {
    const page = Math.max(0, (interaction.options.getInteger("page") || 1) - 1);
    const top = store.getLeaderboard(interaction.guild.id, 100).slice(page * 10, page * 10 + 10);
    if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No data on this page.")] });
    const text = top.map((e, i) => `**${page * 10 + i + 1}.** <@${e.userId}> — ${e.xp.toLocaleString()} XP`).join("\n");
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle("📊 Rankings").setColor(config.colors.primary).setDescription(text)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("stats").setDescription("Server level stats."), async execute(interaction) {
    const top = store.getLeaderboard(interaction.guild.id, 100);
    const totalXp = top.reduce((s, e) => s + e.xp, 0);
    await interaction.reply({ embeds: [info("Server Stats", `**Users:** ${top.length}\n**Total XP:** ${totalXp.toLocaleString()}\n**Top user:** ${top[0] ? `<@${top[0].userId}>` : "None"}`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("progress").setDescription("Your level progress."), async execute(interaction) {
    const u = store.getUser(interaction.guild.id, interaction.user.id);
    const info = store.levelFromXp(u.xp);
    const pct = Math.floor((info.currentXp / info.needed) * 100);
    const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    await interaction.reply({ embeds: [info("Progress", `Level ${u.level} → ${u.level + 1}\n${bar} **${pct}%**\n${info.currentXp}/${info.needed} XP`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("nextlevel").setDescription("XP needed for next level."), async execute(interaction) {
    const u = store.getUser(interaction.guild.id, interaction.user.id);
    const info = store.levelFromXp(u.xp);
    await interaction.reply({ embeds: [info("Next Level", `You need **${info.needed - info.currentXp} XP** more to reach Level **${u.level + 1}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("levelupnotify").setDescription("Enable/disable level-up DMs.").setBooleanOption((o) => o.setName("enabled").setDescription("Enabled").setRequired(true)), async execute(interaction) {
    const enabled = interaction.options.getBoolean("enabled");
    store.setSetting(interaction.guild.id, `dm_${interaction.user.id}`, enabled);
    await interaction.reply({ embeds: [success("Level-Up DM", enabled ? "You'll get a DM on level up." : "DM disabled.")] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("leaderboardsettings").setDescription("Leaderboard settings.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const s = store.getSettings(interaction.guild.id);
    await interaction.reply({ embeds: [info("Leaderboard Settings", `**Rewards:** ${(s.rewards || []).length}\n**Enabled:** ${s.enabled ?? true}\n**XP/msg:** ${s.xpPerMessage || config.xpPerMessage}`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("givelevel").setDescription("Give a user levels.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("levels").setDescription("Levels").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const levels = interaction.options.getInteger("levels");
    const u = store.getUser(interaction.guild.id, user.id);
    let total = u.xp;
    for (let i = 1; i <= levels; i++) total += store.xpForLevel(u.level + i);
    store.setXp(interaction.guild.id, user.id, total);
    await interaction.reply({ embeds: [success("Levels Given", `Gave **${levels}** levels to **${user.tag}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("takelevel").setDescription("Take levels from a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("levels").setDescription("Levels").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const levels = interaction.options.getInteger("levels");
    const u = store.getUser(interaction.guild.id, user.id);
    let total = u.xp;
    for (let i = 0; i < levels; i++) total = Math.max(0, total - store.xpForLevel(Math.max(1, u.level - i)));
    store.setXp(interaction.guild.id, user.id, total);
    await interaction.reply({ embeds: [success("Levels Taken", `Took **${levels}** levels from **${user.tag}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("compare").setDescription("Compare levels with another user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)), async execute(interaction) {
    const other = interaction.options.getUser("user");
    const a = store.getUser(interaction.guild.id, interaction.user.id);
    const b = store.getUser(interaction.guild.id, other.id);
    const diff = a.level - b.level;
    await interaction.reply({ embeds: [info("Compare", `**${interaction.user.tag}:** Level ${a.level} (${a.xp} XP)\n**${other.tag}:** Level ${b.level} (${b.xp} XP)\n**Difference:** ${diff > 0 ? `You're ahead by ${diff} levels` : diff < 0 ? `They're ahead by ${Math.abs(diff)} levels` : "You're tied!"}`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("estimate").setDescription("Estimate levels from XP.").addIntegerOption((o) => o.setName("xp").setDescription("XP").setRequired(true)), async execute(interaction) {
    const xp = interaction.options.getInteger("xp");
    const info = store.levelFromXp(xp);
    await interaction.reply({ embeds: [info("Estimate", `**${xp.toLocaleString()} XP** ≈ **Level ${info.level}**.\n(${info.currentXp}/${info.needed} to next level)`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("disablexp").setDescription("Disable XP for a channel.").addChannelOption((o) => o.setName("channel").setDescription("The channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const s = store.getSettings(interaction.guild.id);
    const disabled = s.disabledChannels || [];
    disabled.push(channel.id);
    store.setSetting(interaction.guild.id, "disabledChannels", disabled);
    await interaction.reply({ embeds: [success("Disabled", `XP disabled in ${channel}.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("enablexp").setDescription("Enable XP in a channel.").addChannelOption((o) => o.setName("channel").setDescription("The channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const s = store.getSettings(interaction.guild.id);
    store.setSetting(interaction.guild.id, "disabledChannels", (s.disabledChannels || []).filter((c) => c !== channel.id));
    await interaction.reply({ embeds: [success("Enabled", `XP enabled in ${channel}.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("xpgain").setDescription("Check XP gain rate."), async execute(interaction) {
    const s = store.getSettings(interaction.guild.id);
    await interaction.reply({ embeds: [info("XP Gain", `You gain **${s.xpPerMessage || config.xpPerMessage} XP** per message (1/min).`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("rolecheck").setDescription("Check if you're due a reward role."), async execute(interaction) {
    const u = store.getUser(interaction.guild.id, interaction.user.id);
    const rewards = store.getSettings(interaction.guild.id).rewards || [];
    const pending = rewards.filter((r) => r.level <= u.level);
    if (pending.length === 0) return interaction.reply({ embeds: [info("Role Check", "No reward roles to claim yet.")] });
    const member = interaction.member;
    for (const r of pending) {
      if (!member.roles.cache.has(r.role)) await member.roles.add(r.role).catch(() => {});
    }
    await interaction.reply({ embeds: [success("Roles Claimed", `Claimed **${pending.length}** reward roles!`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("levelhistory").setDescription("Message count & history."), async execute(interaction) {
    const u = store.getUser(interaction.guild.id, interaction.user.id);
    await interaction.reply({ embeds: [info("History", `**Messages:** ${u.messages}\n**Current level:** ${u.level}\n**Total XP:** ${u.xp}`)] });
  } },
];
