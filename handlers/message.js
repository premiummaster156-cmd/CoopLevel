const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const store = require("../utils/store");
const logger = require("../utils/logger");
const { error, success } = require("../utils/embed");

async function handleMessage(client, message) {
  if (message.author.bot || !message.guild) return;

  // Prefix commands
  if (!message.channel.type === 1 && message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(cmdName) || client.prefixCommands.get(client.prefixAliases.get(cmdName));
    if (command) {
      try { await command.execute(message, args, client); }
      catch (err) {
        logger.error(`Error in prefix command ${cmdName}:`, err);
        message.reply({ embeds: [error("Error", "Something went wrong.")] }).catch(() => {});
      }
      return;
    }
  }

  // Award XP
  if (store.canGainXp(message.guild.id, message.author.id)) {
    const result = store.addXp(message.guild.id, message.author.id, config.xpPerMessage);
    if (result.leveledUp) {
      const settings = store.getSettings(message.guild.id);
      const channel = settings.levelUpChannel ? message.guild.channels.cache.get(settings.levelUpChannel) : message.channel;
      const embed = new EmbedBuilder().setColor(config.colors.success)
        .setTitle("🎉 Level Up!")
        .setDescription(`${message.author} reached **Level ${result.current.level}**!`)
        .setFooter({ text: "CoopLevel" });
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }
}
module.exports = { handleMessage };
