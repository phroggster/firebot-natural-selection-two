# About
This is a [Firebot](https://firebot.app) script to add integration with the [Natural Selection 2](https://store.steampowered.com/app/4920/Natural_Selection_2/) game created by [Unknown Worlds Entertainment](https://store.steampowered.com/developer/unknown-worlds). Natural Selection 2 is a multiplayer first-person shoorter and real-time strategy game.

This is a work-in-progress, and some features are subject to change. It is currently designed to work with Firebot v5.

### License
SPDX-License-Identifier: [GPL-3.0-or-later](https://spdx.org/licenses/GPL-3.0-or-later.html)

This project is licensed under the terms of the GNU General Public License (GPL) version 3, or at your option, any later version of the GPL. In summary: you may copy, distribute, and modify the software. Any redistributed modifications to this software must also be made available under the terms of the GPL. However, you should review the [full terms of the license](https://www.gnu.org/licenses/gpl-3.0.en.html) for more detail.

## Design
This script monitors the NS2 log file (at `%APPDATA%\Natural Selection 2\log.txt`), adds some state tracking for it, and Bob's yer uncle.

## Installation
1. Download the latest `naturalSelectionTwoFirebot.js` file from [Releases](https://github.com/phroggster/firebot-natural-selection-two/releases).
2. Activate the Firebot window, and navigate to *Settings* (gear icon in bottom left), then the *Scripts* page.
3. **Enable** Custom Scripts *if* they are presently Disabled.
4. Click the *"Manage* *Startup* *Scripts*" button.
5. Click the *"Add* *New* *Script"* button, then click the <ins>scripts folder</ins> link in the top box.
6. Copy or move the `naturalSelectionTwoFirebot.js` file downloaded in step 1 into the folder that appeared, then close the folder.
7. Click the 🔄 (sync icon) in the *"Add* *New* *Startup* *Script"* dialog, then select the `naturalSelectionTwoFirebot.js` file from the *"Pick* *one"* dropdown.
6. (*Optional*) Adjust the script settings *if* desired.
7. *Save* the script settings, dismiss the "*Startup* *Scripts*" dialog, and you should now have a variety of new events and variables related to Natural Selection 2 available in Firebot.

### Effects
- `Pause Events`: Pauses all NS2 events from being triggered. Mainly for development purposes, but could also be used in something like an "OBS Scene Changed" event to pause events when the game capture isn't visible.
- `Resume Events`: Resumes NS2 events that were previously paused by the "Natural Selection 2: Pause Events" effect mentioned directly above.

### Events
This script adds the following events to Firebot:

| Id | Event Variable | Description | Varible Example(s) |
|---|---|---|---|
| `connected` | | Occurs when a connection is first established to a server. | |
| `map-changed` | | Occurs after a map has been loaded. | |
| `map-changing` | | Occurs when the map starts changing, *but* *before* *we* *know* *what* *map* *is* *next.* | |
| `round-completed` | | Occurs when either (or perhaps neither) team wins a round. | |
| | `$winningTeam` | The name of the team that won the round. | "Aliens", "Marines" |
| `skill-updated` | | Occurs when a player's skill information is updated. | |

These events are potentially doable, but not (yet) implemented:
- `Chat Message`
- `Killed`

The following events are desired, but seemingly cannot be implemented without breaking in-game consistency checking. Much sadge: `Commander Start`, `Commander End`, `Evolve`, `Joined Team`, `Map Changing` (but with information about what map is being loaded), `Map Vote Started`, `Research Started`, `Research Completed`, `Round Reset`, `Round Start`, `Server Disconnected`

### Variables
This script adds support for the following variables to Firebot:

| Variable | Description | Example Result(s) |
|---|---|---|
| `$ns2GameMode` | The *mode* of the map currently being played | "NS2", "CO", "SWS", "SG", etc. |
| `$ns2MapName` | The *name* of the map currently being played | "ns2_veil", "ns2_tram", "ns2_veil", "ns2_descent", "ns2_tram", "ns2_veil", "ns2_tram" |
| `$ns2ServerAddress` | The ip address and port of the server being played on. | "160.202.166.31:27015" |
| `$ns2ServerConnectLink` | One-click URL to allow other players to connect to the server. | "steam://run/4920//+connect%20160.202.166.31:27015" |
| `$ns2ServerLocation` | The location of the server being played on. | "United States", "Canada", "Germany", "United Kingdom", "Austrailia", etc. |
| `$ns2ServerName` | A short name of the server being played on. | "Medi's House of Pain", "ENSL NYC", "BAD US #3 (CBM)" |
| `$ns2PlayerSkill` | Alias for `$ns2PlayerSkill[Summary]`. | |
| `$ns2PlayerSkill[Summary]` | A brief textual summary of the player's various skill levels. | "Skill: 4181, ComSkill: 2087, TDSkill: 3661, TDComSkill: 1431" |
| `$ns2PlayerSkill[Pub]` | A brief textual summary of the player's pub skill levels. | "Skill: 4181, ComSkill: 2087" |
| `$ns2PlayerSkill[Skill]` | Overall skill level. | 4181 |
| `$ns2PlayerSkill[Com]` | Overall commander skill level. | 2087 |
| `$ns2PlayerSkill[Alien]` | Alien skill level. | 4326 |
| `$ns2PlayerSkill[Marine]` | Marine skill level. | 4036 |
| `$ns2PlayerSkill[AlienCom]` | Alien commander skill level. | 2219 |
| `$ns2PlayerSkill[MarineCom]` | Marine commander skill level. | 1955 |
| `$ns2PlayerSkill[Td]` | A brief textual summary of the player's ThunderDome skill levels. | "Skill: 3661, ComSkill: 1431" |
| `$ns2PlayerSkill[TDSkill]` | ThunderDome overall skill level. | 3661 |
| `$ns2PlayerSkill[TDCom]` | ThunderDome commander skill level. | 1431 |
| `$ns2PlayerSkill[TDAlien]` | ThunderDome alien skill level. | 3664 |
| `$ns2PlayerSkill[TDMarine]` | ThunderDome marine skill level. | 3658 |
| `$ns2PlayerSkill[TDAlienCom]` | ThunderDome alien commander skill level. | 1405 |
| `$ns2PlayerSkill[TDMarineCom]` | ThunderDome marine commander skill level. | 1457 |
| `$ns2SkillChange` | Alias for `$ns2SkillChange[Summary]`. | |
| `$ns2SkillChange[Summary]` | A brief textual summary of the player's most recent overall skill value change. | "Skill: +28", "Skill: -16, ComSkill: -4", "TDSkill: +12, TDComSkill: +5" |
| `$ns2SkillChange[Pub]` | A brief textual summary of the player's most recent overall skill value change in pubs. | "Skill: +28, ComSkill: +2" |
| `$ns2SkillChange[Skill]` | The player's most recent overall skill value change in pubs as a number. | 28, -12, 16, -6, -19, -25 |
| `$ns2SkillChange[Com]` | The player's most recent overall commander skill value change in pubs as a number. | -24, -18, 14, 16, -20 |
| `$ns2SkillChange[Alien]` | The player's most recent alien team skill value change in pubs as a number. | 14, 16, -24, 19, -28 |
| `$ns2SkillChange[AlienCom]` | The player's most recent alien commander skill value change in pubs as a number. | 1, -2, -3, 4 |
| `$ns2SkillChange[Marine]` | The player's most recent marine team skill value change in pubs as a number. | 16, -16, 16, -16 |
| `$ns2SkillChange[MarineCom]` | The player's most recent marine commander skill value change in pubs as a number. | 15, 19, -20, 100 |
| `$ns2SkillChange[TD]` | A brief textual summary of the player's most recent overall skill value change in ThunderDome. | "Skill: +34, ComSkill: +2" |
| `$ns2SkillChange[TDSkill]` | The player's most recent overall skill value change in ThunderDome as a number. | 8, -4, 20, -100, 84 |
| `$ns2SkillChange[TDCom]` | The player's most recent overall commander skill value change in ThunderDome as a number. | 12, -13, 12, -13 |
| `$ns2SkillChange[TDAlien]` | The player's most recent alien team skill value change in ThunderDome as a number. | 69 |
| `$ns2SkillChange[TDAlienCom]` | The player's most recent alien commander skill value change in ThunderDome as a number. | 420 |
| `$ns2SkillChange[TDMarine]` | The player's most recent marine team skill value change in ThunderDome as a number. | 6, 9, 4, 2, 0 |
| `$ns2SkillChange[TDMarineCom]` | The player's most recent marine commander skill value change in ThunderDome as a number. | 1, 2, -3, 4, 6, -9 |

- `$ns2LastRoundUrl` (*NOT* implemented)
  - This one is more of a dream at this point, but *may* be achievable.
  - Provides a link to ns2panel for the last round played
  - Will have to track server name/ip address and scrape it from their web site?

### Building
Run `npm run build` to compile it into the dist subfolder.

Run `npm run build:dev` to compile and copy it into your Firebot profile's script folder. You will *likely* **need** to restart Firebot if it is already running.

### Testing
Not yet implemented, and horribly broken. Will someone help me here, wtf am I doing wrong? But `npm run test` once these bugs are sorted out.
