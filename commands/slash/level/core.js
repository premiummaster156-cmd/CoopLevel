const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function xpForLevel(level) { return 5 * level * level + 50 * level + 100; }

module.exports = [
  { category: "level", data: new SlashCommandBuilder().setName("rank").setDescription("Check your rank.").addUserOption((o) => o.setName("user").setDescription("The user")), async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const u = store.getUser(interaction.guild.id, user.id);
    const info = store.levelFromXp(u.xp);
    const top = store.getLeaderboard(interaction.guild.id, 100);
    const rank = top.findIndex((e) => e.userId === user.id) + 1 || "—";
    const embed = new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary)
      .addFields(
        { name: "Level", value: `**${u.level}**`, inline: true },
        { name: "XP", value: `${u.xp.toLocaleString()}`, inline: true },
        { name: "Rank", value: `#${rank}`, inline: true },
        { name: "Messages", value: `${u.messages}`, inline: true },
        { name: "Progress", value: `${info.currentXp}/${info.needed} XP`, inline: true },
      )
      .setThumbnail(user.displayAvatarURL());
    await interaction.reply({ embeds: [embed] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("leaderboard").setDescription("View the leaderboard.").addIntegerOption((o) => o.setName("limit").setDescription("Number of entries")), async execute(interaction) {
    const limit = Math.min(interaction.options.getInteger("limit") || 10, 50);
    const top = store.getLeaderboard(interaction.guild.id, limit);
    if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No level data yet.")] });
    const text = top.map((e, i) => {
      const medals = ["🥇", "🥈", "🥉"];
      return `${medals[i] || `**${i + 1}.**`} <@${e.userId}> — Level **${e.level}** (${e.xp.toLocaleString()} XP)`;
    }).join("\n");
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle("🏆 Level Leaderboard").setColor(config.colors.primary).setDescription(text)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("level").setDescription("Check a user's level.").addUserOption((o) => o.setName("user").setDescription("The user")), async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const u = store.getUser(interaction.guild.id, user.id);
    await interaction.reply({ embeds: [info("Level", `**${user.tag}** is **Level ${u.level}** with **${u.xp.toLocaleString()} XP**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("xp").setDescription("Check your XP.").addUserOption((o) => o.setName("user").setDescription("The user")), async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const u = store.getUser(interaction.guild.id, user.id);
    const info = store.levelFromXp(u.xp);
    await interaction.reply({ embeds: [info("XP", `**${user.tag}** has **${u.xp.toLocaleString()} XP**\n${info.currentXp}/${info.needed} XP to next level.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("rewards").setDescription("View level rewards."), async execute(interaction) {
    const rewards = store.getSettings(interaction.guild.id).rewards || [];
    if (rewards.length === 0) return interaction.reply({ embeds: [info("Level Rewards", "No rewards configured.")] });
    const text = rewards.map((r) => `Level **${r.level}** → <@&${r.role}>`).join("\n");
    await interaction.reply({ embeds: [info("🎁 Level Rewards", text)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("setxp").setDescription("Set a user's XP.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("XP amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    store.setXp(interaction.guild.id, user.id, amount);
    await interaction.reply({ embeds: [success("XP Set", `Set **${user.tag}**'s XP to **${amount}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("addxp").setDescription("Add XP to a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("XP amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const u = store.getUser(interaction.guild.id, user.id);
    store.setXp(interaction.guild.id, user.id, u.xp + amount);
    await interaction.reply({ embeds: [success("XP Added", `Added **${amount} XP** to **${user.tag}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("removexp").setDescription("Remove XP from a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("XP amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const u = store.getUser(interaction.guild.id, user.id);
    store.setXp(interaction.guild.id, user.id, Math.max(0, u.xp - amount));
    await interaction.reply({ embeds: [success("XP Removed", `Removed **${amount} XP** from **${user.tag}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("resetlevel").setDescription("Reset a user's level.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    store.resetUser(interaction.guild.id, user.id);
    await interaction.reply({ embeds: [success("Reset", `Reset **${user.tag}**'s level.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("resetall").setDescription("Reset all levels.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    store.resetAll(interaction.guild.id);
    await interaction.reply({ embeds: [warning("Reset All", "All levels have been reset.")] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("setlevel").setDescription("Set a user's level.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("level").setDescription("Level").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const level = interaction.options.getInteger("level");
    let xp = 0;
    for (let i = 1; i < level; i++) xp += xpForLevel(i);
    store.setXp(interaction.guild.id, user.id, xp);
    await interaction.reply({ embeds: [success("Level Set", `Set **${user.tag}** to Level **${level}**.`)] }); }
  } ,
  { category: "level", data: new SlashCommandBuilder().setName("addlevel").setDescription("Add levels to a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("levels").setDescription("Levels").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const user = interaction.options.getUser("user");
    const levels = interaction.options.getInteger("levels");
    const u = store.getUser(interaction.guild.id, user.id);
    let total = u.xp;
    for (let i = 1; i <= levels; i++) total += xpForLevel(u.level + i);
    store.setXp(interaction.guild.id, user.id, total);
    await interaction.reply({ embeds: [success("Levels Added", `Added **${levels}** levels to **${user.tag}**.`)] }); }
  } ,
  { category: "level", data: new SlashCommandBuilder().setName("levels").setDescription("View all your levels info."), async execute(interaction) {
    const u = store.getUser(interaction.guild.id, interaction.user.id);
    const info = store.levelFromXp(u.xp);
    const msg = await interaction.reply({ embeds: [info("Level Stats", `**Level:** ${u.level}\n**XP:** ${u.xp}\n**Messages:** ${u.messages}\n**To next:** ${info.currentXp}/${info.needed}`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("levelup").setDescription("View level-up channel settings."), async execute(interaction) {
    const s = store.getSettings(interaction.guild.id);
    await interaction.reply({ embeds: [info("Level-Up Channel", s.levelUpChannel ? `Set to <#${s.levelUpChannel}>.` : "Not set. Use /setlevelupchannel.")] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("setlevelupchannel").setDescription("Set the level-up channel.").addChannelOption((o) => o.setName("channel").setDescription("The channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    store.setSetting(interaction.guild.id, "levelUpChannel", channel.id);
    await interaction.reply({ embeds: [success("Channel Set", `Level-up messages will go to ${channel}.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("addreward").setDescription("Add a level reward.").addIntegerOption((o) => o.setName("level").setDescription("Level").setRequired(true)).addRoleOption((o) => o.setName("role").setDescription("Reward role").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const level = interaction.options.getInteger("level");
    const role = interaction.options.getRole("role");
    const s = store.getSettings(interaction.guild.id);
    const rewards = s.rewards || [];
    rewards.push({ level, role: role.id });
    store.setSetting(interaction.guild.id, "rewards", rewards);
    await interaction.reply({ embeds: [success("Reward Added", `Level **${level}** now rewards **${role.name}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("removereward").setDescription("Remove a level reward.").addIntegerOption((o) => o.setName("level").setDescription("Level").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const level = interaction.options.getInteger("level");
    const s = store.getSettings(interaction.guild.id);
    const rewards = (s.rewards || []).filter((r) => r.level !== level);
    store.setSetting(interaction.guild.id, "rewards", rewards);
    await interaction.reply({ embeds: [success("Reward Removed", `Removed reward for Level **${level}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("setxppermessage").setDescription("Set XP per message.").addIntegerOption((o) => o.setName("amount").setDescription("XP").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    store.setSetting(interaction.guild.id, "xpPerMessage", amount);
    await interaction.reply({ embeds: [success("XP/Msg", `Set XP per message to **${amount}**.`)] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("toggleleveling").setDescription("Enable/disable XP.").addBooleanOption((o) => o.setName("enabled").setDescription("Enabled").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const enabled = interaction.options.getBoolean("enabled");
    store.setSetting(interaction.guild.id, "enabled", enabled);
    await interaction.reply({ embeds: [success("Leveling", enabled ? "Leveling is **enabled**." : "Leveling is **disabled**.")] });
  } },
  { category: "level", data: new SlashCommandBuilder().setName("levelsettings").setDescription("View level settings.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    const s = store.getSettings(interaction.guild.id);
    await interaction.reply({ embeds: [info("Level Settings", `**Enabled:** ${s.enabled ?? true}\n**XP/msg:** ${s.xpPerMessage || config.xpPerMessage}\n**Level-up channel:** ${s.levelUpChannel ? `<#${s.levelUpChannel}>` : "Not set"}`)] });
  } },
];
