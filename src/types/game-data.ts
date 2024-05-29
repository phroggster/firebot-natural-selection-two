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

import { NS2_EXAMPLE_GAME_MODE, NS2_EXAMPLE_MAP_NAME, NS2_EXAMPLE_SERVER_ADDR } from "../constants";
import serverList from "../server-list";
import { EGameState, GameData } from "../types";

type MinGameInfoModel = {
    mapName: string;
    serverAddr: string;
    state: EGameState;
};

/**
 * Convert a MinGameInfoModel into a full-fledged GameInfoModel.
 * @param model A MinGameInfoModel to expand.
 * @returns A GameInfoModel with extra information, or null.
 */
export function inflateGameInfoData(model: MinGameInfoModel): GameData {
    if (model == null || model == undefined) {
        throw new Error('model parameter is null or undefined');
    }

    const mapName = model.mapName?.trim() ?? NS2_EXAMPLE_MAP_NAME;
    const serverAddr = model.serverAddr?.trim() ?? NS2_EXAMPLE_SERVER_ADDR;

    return {
        mapName: mapName,
        serverAddr: serverAddr,
        state: model.state,

        gameMode: getGameModeFromMapName(mapName) ?? "Unknown",
        serverLocation: getServerLocationFromAddress(serverAddr) ?? "Unknown",
        serverName: getServerNameFromAddress(serverAddr) ?? "Unknown",
    };
};

/**
 * Computes the game mode for a given map name.
 * @param mapName The map name to get the game mode for.
 * @returns A string describing the game mode of the map, or null.
 */
export function getGameModeFromMapName(mapName: string): string {
    const lut = [
        { k: NS2_EXAMPLE_MAP_NAME, v: NS2_EXAMPLE_GAME_MODE },
        { k: "co_", v: "Combat" },
        { k: "dc_", v: "Defense" },
        { k: "de_", v: "Defense" },
        { k: "gg_", v: "Gun Game" },
        { k: "gr_", v: "Gorge Run" },
        { k: "inf_", v: "Infested" },
        { k: "ls_", v: "Last Stand" },
        { k: "pl_", v: "Payload" },
        { k: "sg_", v: "Siege" },
        { k: "sws_", v: "Skulks With Shotguns" },
        { k: "tow_", v: "Tug of War" },

        // These are intentionally at the end to try and match 'ns2_co_*' or 'ns2_inf_*' before 'ns2_veil'
        { k: "ns_", v: "Normal" },
        { k: "ns1_", v: "Normal" },
        { k: "ns2_", v: "Normal" },
    ];

    mapName = mapName?.trim()?.toLowerCase();
    if (mapName && mapName.length >= 4) {
        if (mapName == "unknown") {
            return "unknown";
        }
        for (const kvp of lut) {
            if (mapName.startsWith("ns2_".concat(kvp.k)) || mapName.startsWith("ns_".concat(kvp.k)) || mapName.startsWith(kvp.k)) {
                return kvp.v;
            }
        }
    }
    return "unknown";
}

/**
 * Gets a URI to allow for users to automatically connect to the game server.
 * @param serverAddr The game server's IP:port.
 * @param passWord (optional, default null) The game server's password.
 * @returns A Steam URI that allows for rapid inviting of other users, or null.
 */
export function getSteamConnectUriFromAddress(serverAddr: string, passWord: string | null = null): string | null {
    const minLen = 9; // "1.2.3.4:5".length;

    serverAddr = serverAddr?.trim();
    if (serverAddr && serverAddr.length >= minLen) {
        const conn = encodeURIComponent("+connect ".concat(serverAddr));
        const pass = passWord !== null && passWord.length >= 1
            ? encodeURIComponent(" +password ".concat(passWord.trim()))
            : "";
        return "steam://run/4920//".concat(conn).concat(pass);
    }
    return null;
};

/**
 * Gets the location information for a game server.
 * @param serverAddr The game server's IP:port.
 * @returns The location (country name) for a given game server, or null.
 */
export function getServerLocationFromAddress(serverAddr: string): string | null {
    const minLen = 9; // "1.2.3.4:5".length;

    serverAddr = serverAddr?.trim();
    if (serverAddr && serverAddr.length >= minLen) {
        const item = serverList.find(s => s.ip === serverAddr);
        if (item !== null && item !== undefined) {
            return item.country;
        }
    }
    return null;
};

/**
 * Gets the shorthand name of the provided game server at @param serverAddr.
 * @param serverAddr An "IP Address:Port" of a game server.
 * @returns A shorthand name representing the server, or null.
 */
export function getServerNameFromAddress(serverAddr: string): string | null {
    const minLen = 9; // "1.3.5.7:9".length;

    serverAddr = serverAddr?.trim();
    if (serverAddr && serverAddr.length >= minLen) {
        const item = serverList.find(s => s.ip === serverAddr);
        if (item !== null && item !== undefined) {
            return item.name;
        }
    }
    return null;
};
