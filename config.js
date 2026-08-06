require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  devGuildId: process.env.DEV_GUILD_ID || null,
  prefix: process.env.PREFIX || "!",
  ownerIds: (process.env.OWNER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean),
  xpPerMessage: parseInt(process.env.XP_PER_MESSAGE, 10) || 5,
  xpCooldown: parseInt(process.env.XP_COOLDOWN, 10) || 60,
  levelUpChannelId: process.env.LEVEL_UP_CHANNEL_ID || null,
  colors: {
    primary: 0x3b82f6,
    success: 0x22c55e,
    warning: 0xf59e0b,
    danger: 0xef4444,
    info: 0x3b82f6,
    neutral: 0x64748b,
  },
};
