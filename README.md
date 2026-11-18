# CoopLevel

**CoopLevel** tracks member activity, grants XP, calculates levels and ranks, and supports role rewards.

## Features

- Passive XP awards from guild message activity
- XP cooldown and configurable XP rate
- Rank cards, progress, leaderboards and level statistics
- Level-up announcements and role rewards
- Admin tools for setting, adding, removing and resetting XP/levels
- Channel-level XP controls and leveling settings
- Utility and fun commands

## Requirements

- Node.js 22 or newer
- A Discord application and bot token
- The `bot` and `applications.commands` OAuth2 scopes

CoopLevel listens for guild message events to award XP, but it does not read message text. Enable the **Server Members Intent** if you use member-based role rewards. Message Content Intent is not required.

## Setup

```bash
npm install
cp .env.example .env
```

Configure:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
DEV_GUILD_ID=
OWNER_IDS=
XP_PER_MESSAGE=5
XP_COOLDOWN=60
LEVEL_UP_CHANNEL_ID=
```

## Register slash commands

For a test server, set `DEV_GUILD_ID` and run:

```bash
npm run check:commands
npm run register:guild
```

For global registration:

```bash
npm run deploy
```

Start the bot:

```bash
npm start
```

## Example commands

`/rank`, `/leaderboard`, `/progress`, `/nextlevel`, `/setxp`, `/addxp`, `/setlevel`, `/addreward`, `/setlevelupchannel`, and `/levelsettings`.

Use `/help` in Discord for the live command list.

## Project structure

- `commands/slash/` — leveling and utility command modules
- `handlers/message.js` — passive XP awards (message content is not accessed)
- `handlers/interaction.js` — slash and component interaction routing
- `utils/` — leveling data, settings, formatting and logging helpers
- `deploy-commands.js` — command schema validation and registration

## Notes

- Never commit your bot token or other secrets.
- Awarded XP is controlled by the cooldown and XP-per-message settings.
- Make sure the bot can manage the reward roles it assigns.
