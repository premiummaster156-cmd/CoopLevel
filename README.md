<div align="center">

# 🆙 CoopLevel

### The all-in-one Discord leveling & XP bot with **79 slash commands** + **46 prefix commands**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/discord.js-14-blueviolet.svg)](https://discord.js.org)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](#)

</div>

CoopLevel brings a full **leveling & XP system** to your Discord server. Members gain XP by chatting, level up as they progress, and unlock reward roles. Admins have full control over XP rates, level rewards, and more. Works as both **slash commands** and **prefix commands**.

---

## 📦 Features

- 🆙 **XP System** — gain XP by chatting (per message)
- 📊 **Levels & Ranks** — check your level, rank, and progress
- 🏆 **Leaderboards** — compete for the top spot
- 🎁 **Level Rewards** — auto-grant roles at specific levels
- ⚙️ **Admin Controls** — set/add/remove XP, set levels
- 📢 **Level-Up Messages** — configurable channel
- 🎛️ **Channel Controls** — disable XP in specific channels
- 🎉 **Utility & Fun** — polls, memes, moderation, and more

---

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org) **v18 or higher**
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Step 1 — Create the bot on Discord

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Name it `CoopLevel`.
3. Go to the **Bot** tab → click **Reset Token** → copy the token.
4. Enable the **Message Content Intent**.
5. Under **OAuth2 → URL Generator**: scopes `bot`, `applications.commands`; permissions **Administrator**.
6. Use the URL to invite the bot.

### Step 2 — Set up the project

```bash
git clone https://github.com/CoopFT/CoopLevel.git
cd CoopLevel
npm install
cp .env.example .env
```

### Step 3 — Configure `.env`

```env
TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
DEV_GUILD_ID=
PREFIX=!
OWNER_IDS=
XP_PER_MESSAGE=5
XP_COOLDOWN=60
LEVEL_UP_CHANNEL_ID=
```

### Step 4 — Register commands & run

```bash
npm run register:guild   # or npm run deploy for global
npm start
```

You should see:
```
[OK] Loaded 79 slash commands.
[OK] Loaded 46 prefix commands.
[OK] Logged in as CoopLevel#1234
```

---

## 🎮 Quick Start

1. Invite the bot with **Administrator** permissions.
2. Members start earning XP automatically when they chat.
3. Check your rank: `/rank`.
4. Set up level rewards: `/addreward 5 @Level5`.
5. Set a level-up channel: `/setlevelupchannel #logs`.

---

## 🎮 Command Reference

### Slash Commands (`/`)

#### 🆙 Leveling
| Command | Description |
|---------|-------------|
| `/rank [@user]` | Check rank |
| `/level [@user]` | Check level |
| `/xp [@user]` | Check XP |
| `/leaderboard` | View leaderboard |
| `/top` | Top 3 |
| `/rankings` | Paginated rankings |
| `/stats` | Server XP stats |
| `/progress` | Your progress bar |
| `/nextlevel` | XP to next level |
| `/estimate <xp>` | Estimate level from XP |
| `/compare @user` | Compare levels |
| `/levelhistory` | Message count & history |

#### 🎁 Level Rewards
| Command | Description |
|---------|-------------|
| `/rewards` | View rewards |
| `/addreward <level> @role` | Add a reward |
| `/removereward <level>` | Remove a reward |
| `/rolecheck` | Claim due reward roles |

#### ⚙️ Admin Controls
| Command | Description |
|---------|-------------|
| `/setxp @user <amount>` | Set XP |
| `/addxp @user <amount>` | Add XP |
| `/removexp @user <amount>` | Remove XP |
| `/setlevel @user <level>` | Set level |
| `/addlevel @user <n>` | Add levels |
| `/givelevel @user <n>` | Give levels |
| `/takelevel @user <n>` | Take levels |
| `/resetlevel @user` | Reset a user |
| `/resetall` | Reset all |
| `/setxppermessage <n>` | Set XP/msg |
| `/setlevelupchannel <ch>` | Set level-up channel |
| `/toggleleveling` | Enable/disable |
| `/levelsettings` | View settings |
| `/leaderboardsettings` | Leaderboard settings |
| `/disablexp <ch>` | Disable XP in channel |
| `/enablexp <ch>` | Enable XP in channel |
| `/xpgain` | Check XP gain |
| `/levels` | Your level stats |
| `/levelup` | Level-up channel info |
| `/levelupnotify` | Toggle level-up DMs |

#### 🛠️ Utility & Moderation
`/help` `/ping` `/botinfo` `/invite` `/serverinfo` `/userinfo` `/channelinfo` `/roleinfo` `/avatar` `/uptime` `/say` `/embed` `/poll` `/announce` `/clear` `/slowmode` `/nickname` `/timeout` `/ban` `/kick` `/unban` `/lock` `/unlock` `/createrole` `/deleterole` `/createtextchannel` `/deletetextchannel`

#### 🎉 Fun
`/coinflip` `/dice` `/joke` `/8ball` `/catfact` `/dogfact` `/rate` `/meme` `/roast` `/hug` `/slap` `/fortune` `/xpjoke` `/levelquiz` `/reverse` `/clap` `/mock` `/emojisay`

**Total: 79 slash commands** ✨

---

### Prefix Commands (`!`)

`!rank` `!level` `!leaderboard` `!xp` `!progress` `!nextlevel` `!stats` `!setxp` `!addxp` `!removexp` `!resetlevel` `!resetall` `!setlevel` `!rewards` `!addreward` `!removereward` `!setxppermessage` `!setlevelupchannel` `!toggleleveling` `!help` `!ping` `!botinfo` `!invite` `!serverinfo` `!userinfo` `!avatar` `!uptime` `!clear` `!say` `!poll` `!announce` `!coinflip` `!dice` `!joke` `!8ball` `!rate` `!mock` `!reverse` `!clap` `!fortune` `!catfact` `!dogfact` `!meme` `!roast` `!hug` `!slap` `!slowmode` `!ban` `!kick` `!timeout`

**Total: 46 prefix commands** 🤖

---

## 📘 Tutorial — How to Use CoopLevel

### 1. Getting Started

1. Invite the bot and grant **Administrator** permissions.
2. Members automatically earn XP when they send messages.
3. Check your rank anytime: `/rank`.

### 2. Earning XP

- You gain **5 XP** per message (configurable).
- There's a **60-second cooldown** between XP gains.
- Set higher XP with `/setxppermessage 10`.

### 3. Level Rewards

Reward your active members:
- `/addreward 5 @Level5` — grant a role at Level 5.
- `/rewards` — view all rewards.
- `/rolecheck` — claim roles you've earned.

### 4. Admin Controls

As an administrator you can:
- `/setlevel @user 50` — set a member's level.
- `/resetall` — wipe the whole leaderboard.
- `/disablexp #spam` — stop XP farming in a channel.

---

## 🗂️ Project Structure

```
CoopLevel/
├── index.js                 # Entry point
├── deploy-commands.js       # Registers slash commands
├── config.js                # Configuration
├── .env.example
├── commands/
│   ├── slash/               # 79 slash commands
│   │   ├── level/           # core + more
│   │   ├── utility/         # moderation & utility
│   │   └── fun/             # fun commands
│   └── prefix/              # 46 prefix commands
├── handlers/                # ready, interaction, message
├── utils/                   # store.js, embed.js, logger.js
└── package.json
```

---

## 📄 License

MIT License. Made with ❤️ by the CoopFT team. Find more bots on the [CoopFT Marketplace](https://coopft.com/marketplace).

</div>
</content>
