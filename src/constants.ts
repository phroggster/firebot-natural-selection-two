// Natural Selection 2 application integration for Firebot
//
// Copyright � 2024 by phroggie
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

export const NS2_EVENT_SOURCE_ID: string = "ns2";

export const NS2_MAP_CHANGED_EVENT_ID: string = "map-changed";
export const NS2_MAP_CHANGING_EVENT_ID: string = "map-changing";
export const NS2_ROUND_COMPLETED_EVENT_ID: string = "round-completed";
export const NS2_SERVER_CONNECTED_EVENT_ID: string = "server-connected";
export const NS2_SERVER_CONNECTING_EVENT_ID: string = "server-connecting";
export const NS2_SKILL_UPDATED_EVENT_ID: string = "skill-updated";


/** The sample data value for variable ns2ServerAddr: "127.0.0.1:65536" */
export const NS2_EXAMPLE_SERVER_ADDR: string = "127.0.0.1:65536";
/** The sample data value for variable ns2ServerName: "Firebot Example Server" */
export const NS2_EXAMPLE_SERVER_NAME: string = "Firebot Example Server";
/** The sample data value for variable ns2ServerLocation: "Planet 4546B" */
export const NS2_EXAMPLE_SERVER_LOC: string = "Planet 4546B";
/** The sample data value for variable ns2MapName: "ns2_firebot_example" */
export const NS2_EXAMPLE_MAP_NAME: string = "ns2_firebot_example";
/** The sample data value for variable ns2GameMode: "FBeXample" */
export const NS2_EXAMPLE_GAME_MODE: string = "FirebotGameMode";
/** The sample data value for variable ns2WinningTeam: "Viwers Like You" */
export const NS2_EXAMPLE_WINNING_TEAM: string = "Viwers Like You";

type ReadOnlyServerInfo = {
    readonly country: string;
    readonly ip: string;
    readonly name: string;
};
type ReadOnlyServerList = {
    readonly servers: Array<ReadOnlyServerInfo>;
};

// These are manually scraped, partially from https://ns2servers.pw/#servers, and partially from the in-game server browser
// The first one is an placeholder example for various events and should not be seen outside of preview or event testing scenarios. Besides, the port is invalid anyways.

/** A readonly const object that contains a list of server addresses, names, and locations, including the testing sample "server." */
export const serverList: ReadOnlyServerList = Object.freeze(<ReadOnlyServerList>{ servers: [
    Object.freeze(<ReadOnlyServerInfo>{ ip: NS2_EXAMPLE_SERVER_ADDR, name: NS2_EXAMPLE_SERVER_NAME, country: NS2_EXAMPLE_SERVER_LOC }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "123.255.40.79:27015", name: "AdrenaLAN", country: "New Zealand" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27015", name: "BAD EU #1", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27019", name: "BAD EU #2", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27065", name: "BAD EU #3 (CBM)", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27025", name: "BAD EU Noob #1", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27045", name: "BAD EU Noob #2", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27055", name: "BAD EU Noob #3", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "71.142.124.243:27015", name: "BAD US #1", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "71.142.124.243:27065", name: "BAD US #3 (CBM)", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "71.142.124.243:27025", name: "BAD US Noob #1", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "71.142.124.243:27055", name: "BAD US Noob #3", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "18.175.51.31:27018", name: "Community Balance Testing (CBM)", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "221.181.185.249:27004", name: "CN #1 Click", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "221.181.185.249:27002", name: "CN #1 Kharaa", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "221.181.185.249:27008", name: "CN #1 Locker Room", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "221.181.185.249:27000", name: "CN #1 Nanogrid", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "221.181.185.249:27006", name: "CN #1 Standard", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "218.93.208.251:11085", name: "CN #2 Arms Lab", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "218.93.208.251:11081", name: "CN #2 Marine", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "218.93.208.251:11083", name: "CN #2 Playground", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "43.248.185.67:41003", name: "CN #3 Kharaa", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "43.248.185.67:41005", name: "CN #3 Range", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "43.248.185.67:41013", name: "CN #3 Subsector", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "43.248.185.67:41001", name: "CN #3 TSF Training", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "110.42.9.117:27080", name: "China Moeub", country: "China" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "157.90.129.121:31015", name: "Combatground", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "116.203.31.213:27015", name: "Community TD (Kernel Panic)", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "97.117.77.253:27040", name: "Dark Squadron", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "51.68.204.239:27099", name: "DBH", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "160.202.166.26:27025", name: "DMD All Maps (CBM)", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "160.202.167.28:27015", name: "DMD Combat", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "203.17.244.3:27035", name: "DMD EU", country: "Netherlands" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "94.130.132.169:27058", name: "Draakoor's Noob House", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "87.118.112.80:27036", name: "Drunken Skulk", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "136.243.135.61:27023", name: "ENSL Alemania", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "71.142.124.243:27023", name: "ENSL Chapel Hill", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "94.114.65.90:27053", name: "ENSL Skulk Slayer", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "18.175.51.31:27015", name: "ENSL London", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "104.194.9.24:27015", name: "ENSL NYC", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "82.64.74.234:27023", name: "ENSL Paris #1", country: "France" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "82.64.74.234:27015", name: "ENSL Paris #2", country: "France" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "94.26.228.46:27017", name: "ENSL Russia", country: "Russia" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "203.10.96.194:27035", name: "FFA NS2", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "95.149.132.219:29200", name: "FNS NS2", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "43.247.158.122:27017", name: "GGA India", country: "India" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "67.223.99.37:27015", name: "Ghosts of the Revolution", country: "Canada" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "82.64.74.234:27017", name: "Gorge's Lair", country: "France" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "82.64.74.234:27019", name: "Gorge's Lair #2", country: "France" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "76.198.155.37:27015", name: "IBIS Gaming", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "203.23.178.6:27015", name: "I'm On It", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "77.186.27.139:27015", name: "Lila Pause", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "45.186.240.222:27015", name: "Linux ATMSAT", country: "Brazil" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "135.148.59.26:27029", name: "LinuxGSM", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "152.37.107.187:27015", name: "Marktural Selection", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "160.202.166.31:27015", name: "Medi's House of Pain (CBM)", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "94.26.228.46:27015", name: "NS2RUS (CBM)", country: "Russia" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "151.80.40.100:27022", name: "Open Game Room", country: "France" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "78.46.84.175:27015", name: "Playground", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "45.79.2.239:27015", name: "RTK0", country: "United States" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "94.114.65.90:27050", name: "Skulk Slayer", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "13.70.185.159:27015", name: "Sydney NS2", country: "Austrailia" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "46.208.227.45:27015", name: "1234 TD Idle Gang", country: "United Kingdom" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "157.90.129.121:28315", name: "Thirsty Onos (CBM)", country: "Germany" }),
    Object.freeze(<ReadOnlyServerInfo>{ ip: "54.37.31.135:27005", name: "Ultimate Noob", country: "France" }),
]});
