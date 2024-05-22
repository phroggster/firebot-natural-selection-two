# About
This is a [Firebot](https://firebot.app) script to add integration with the [Natural Selection 2](https://store.steampowered.com/app/4920/Natural_Selection_2/) game created by [Unknown Worlds Entertainment](https://store.steampowered.com/developer/unknown-worlds). Natural Selection 2 is a multiplayer first-person shooter and real-time strategy game.

This project is a work-in-progress, and some features are subject to change. It is currently designed to work with Firebot v5.

## License
SPDX-License-Identifier: [GPL-3.0-or-later](https://spdx.org/licenses/GPL-3.0-or-later.html)

This project is licensed under the terms of the GNU General Public License (GPL) version 3, or at your option, any later version of the GPL. See the [LICENSE](LICENSE) file included with this software for details, but in summary: you may use, copy, distribute, and modify the software freely, provided that you license it under these same terms, and provided that you don't distribute it alongsde software of an incompatible license.

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

## Features
[Effects](https://github.com/phroggster/firebot-natural-selection-two/wiki/Effects) | [Events](https://github.com/phroggster/firebot-natural-selection-two/wiki/Events) | [Variables](https://github.com/phroggster/firebot-natural-selection-two/wiki/Variables)

## Building
Run `npm run build` to compile it into the dist subfolder.

Run `npm run build:dev` to compile and copy it into your Firebot profile's script folder. You will *likely* **need** to restart Firebot if it is already running.

## Testing
Not yet implemented, and horribly broken. Will someone help me here, wtf am I doing wrong? But `npm run test` once these bugs are sorted out.
