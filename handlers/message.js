const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const store = require("../utils/store");
const logger = require("../utils/logger");

async function handleMessage(client, message) {
  if (message.author?.bot || !message.guild) return;

  try {
    if (!store.canGainXp(message.guild.id, message.author.id)) return;

    const result = store.addXp(message.guild.id, message.author.id, config.xpPerMessage);
    if (!result?.leveledUp) return;

    const settings = store.getSettings(message.guild.id);
    const configuredChannel = settings.levelUpChannel
      ? await message.guild.channels.fetch(settings.levelUpChannel).catch(() => null)
      : null;
    const channel = configuredChannel?.isTextBased?.() ? configuredChannel : message.channel;
    if (!channel?.isTextBased?.()) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle("Level Up!")
      .setDescription(message.author.toString() + " reached **Level " + result.current.level + "**.")
      .setFooter({ text: "CoopLevel" });

    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error("Unable to award message XP:", error);
  }
}

module.exports = { handleMessage };
