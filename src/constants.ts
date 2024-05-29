// Natural Selection 2 application integration for Firebot
//
// Copyright © 2024 by phroggie
//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

import packageJson from "../package.json";

/** The project's Github repository URI, i.e.: "https://github.com/phroggster/firebot-natural-selection-two" */
export const GITHUB_PROJECT_URI: string = packageJson.repository;
/** The project's Github latest release URI for computers, i.e.: "https://api.github.com/phroggster/firebot-natural-selection-two/releases/latest" */
export const GITHUB_LATEST_RELEASE_API: string = "https://api.github.com/repos/phroggster/firebot-natural-selection-two/releases/latest";
/** The project's Github latest release URI for humans, i.e.: "https://github.com/phroggster/firebot-natural-selection-two/releases/latest" */
export const GITHUB_LATEST_RELEASE_URI: string = GITHUB_PROJECT_URI.concat("/releases/latest");

/** The version number of this plugin module, as a string, e.g.: "0.1.0" */
export const PLUGIN_VERSION_ID: string = packageJson.version;

/** The id for the Natural Selection 2 event source: "ns2" */
export const NS2_EVENT_SOURCE_ID: string = "ns2";

/** The id for the Map Changed event: "map-changed" */
export const NS2_MAP_CHANGED_EVENT_ID: string = "map-changed";
/** The id for the Map Changing event: "map-changing" */
export const NS2_MAP_CHANGING_EVENT_ID: string = "map-changing";
/** The id for the the Round Completed event: "round-completed" */
export const NS2_ROUND_COMPLETED_EVENT_ID: string = "round-completed";
/** The id for the Server Connected event: "server-connected" */
export const NS2_SERVER_CONNECTED_EVENT_ID: string = "server-connected";
/** The id for the Server Connecting event: "server-connecting" */
export const NS2_SERVER_CONNECTING_EVENT_ID: string = "server-connecting";
/** The id for the Skill Updated event: "skill-updated" */
export const NS2_SKILL_UPDATED_EVENT_ID: string = "skill-updated";

/** The sample data value for variable $ns2ServerAddr: "127.0.0.1:65536" */
export const NS2_EXAMPLE_SERVER_ADDR: string = "127.0.0.1:65536";
/** The sample data value for variable $ns2ServerName: "Firebot Example Server" */
export const NS2_EXAMPLE_SERVER_NAME: string = "Firebot Example Server";
/** The sample data value for variable $ns2ServerLocation: "Planet 4546B" */
export const NS2_EXAMPLE_SERVER_LOC: string = "Planet 4546B";
/** The sample data value for variable $ns2MapName: "ns2_firebot_example" */
export const NS2_EXAMPLE_MAP_NAME: string = "ns2_firebot_example";
/** The sample data value for variable $ns2GameMode: "FirebotGameMode" */
export const NS2_EXAMPLE_GAME_MODE: string = "FirebotGameMode";
/** The sample data value for variable $ns2WinningTeam: "Viewers Like You" */
export const NS2_EXAMPLE_WINNING_TEAM: string = "Viewers Like You";
