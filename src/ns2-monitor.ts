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

import { promises as fs } from "fs";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Tail } from "tail";

import {
    NS2_EVENT_SOURCE_ID,
    NS2_MAP_CHANGED_EVENT_ID,
    NS2_MAP_CHANGING_EVENT_ID,
    NS2_ROUND_COMPLETED_EVENT_ID,
    NS2_SERVER_CONNECTING_EVENT_ID,
    NS2_SERVER_CONNECTED_EVENT_ID,
    NS2_SKILL_UPDATED_EVENT_ID,
} from "./constants";
import { logger } from "./logger";
import {
    EGameState,
    GameData,
    GameEventData,
    MapEventData,
    PairedSkillData,
    RoundCompletedEventData,
    ScriptParams,
    ServerEventData,
    SkillUpdatedEventData,
    SkillData,
} from "./types";
import { getSteamConnectUriFromAddress, inflateGameInfoData } from "./types/game-data";
import { deserializeSkillModel, summarizeSkillDataPair } from "./types/skill-data";

type PackedSkillData = {
    current: PairedSkillData;
    prior: PairedSkillData;
    delta: PairedSkillData;
};

var eventManager: ScriptModules["eventManager"];
var fileTail: Tail;
var isManuallyPaused: boolean = false;
var isReadingBacklog: boolean = true;
var lineNum: number = 0;
var lineNumsNeeded: number = 0;

var gameData = {
    gameMode: "unknown",
    mapName: "unknown",
    serverAddr: "none",
    serverLocation: "unknown",
    serverName: "unknown",
    state: EGameState.Unknown
} as GameData;
var skills: PackedSkillData;
var steamId: string = "";

function buildWatcher(pathToLogFile: string): void {
    fileTail?.unwatch();
    lineNum = 0;

    fileTail = new Tail(pathToLogFile, {
        encoding: "utf-8",
        flushAtEOF: true,
        follow: true,
        fromBeginning: true,
        fsWatchOptions: {
            persistent: true,
        },
    });
    fileTail.on("line", (lineStr: string) => {
        ++lineNum;

        if (lineStr == null || lineStr.length < 1) {
            return;
        }
        if (isReadingBacklog && lineNum >= lineNumsNeeded) {
            isReadingBacklog = false;
        }

        let handled =
            handleConnecting(lineStr) ||
            handleMapLoaded(lineStr) ||
            handleModServices(lineStr) ||
            handleSkill(lineStr) ||
            handleSteamId(lineStr) ||
            handleVictory(lineStr);
    });
    fileTail.on("error", (err) => {
        logger.error(`Monitor encountered an error on line ${lineNum}`, err);
    });
};

function clearSkillData(): void {
    skills = {
        current: {
            pub: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
            td: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
        } as PairedSkillData,
        prior: {
            pub: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
            td: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
        } as PairedSkillData,
        delta: {
            pub: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
            td: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            } as SkillData,
        } as PairedSkillData,
    } as PackedSkillData;
};

// count the number of lines in a file. Hope you've got enough memory for it, sorry.
// TODO: this might need to be done differently if we ever block for more than ~10 seconds.
async function countLinesInFile(filePath: string): Promise<number> {
    const data = await fs.readFile(filePath, { encoding: "utf-8" });
    if (data.length <= 0 || !data.includes("\n")) {
        return 0;
    }

    var eol = "\r\n";
    if (!data.includes(eol)) {
        eol = "\n";
    }

    var result = 0;
    for (var n = data.indexOf(eol, 0); n > 0 && n < data.length; n = data.indexOf(eol, n + eol.length)) {
        ++result;
    }
    return result;
};

// [ 31.025] MainThread : Connecting to server 12.34.56.78:90123
function handleConnecting(lineStr: string): boolean {
    const connectingStr = "] MainThread : Connecting to server";
    if (!lineStr || lineStr.length < connectingStr.length + 9 || !lineStr.includes(connectingStr)) {
        return false;
    }

    const serverAddr = lineStr.substring(lineStr.indexOf(connectingStr) + connectingStr.length).trim();
    setState(EGameState.Connecting, `Connecting to server ${serverAddr}`);
    gameData = inflateGameInfoData({ mapName: "unknown", serverAddr: serverAddr, state: EGameState.Connecting });

    if (!isReadingBacklog && !isManuallyPaused) {
        eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_SERVER_CONNECTING_EVENT_ID, gameData as ServerEventData, false);
    }
    return true;
};

// Finished loading 'maps/ns2_descent.level'
function handleMapLoaded(lineStr: string): boolean {
    const mapLoadedStr = "Finished loading 'maps/";
    if (!lineStr.startsWith(mapLoadedStr)) {
        return false;
    }

    var mapNameStr = lineStr.substring(lineStr.indexOf(mapLoadedStr) + mapLoadedStr.length);
    mapNameStr = mapNameStr.substring(0, mapNameStr.lastIndexOf(".level'"));

    const reasonMsg = `Finished loading map ${mapNameStr}`;
    gameData = inflateGameInfoData({ mapName: mapNameStr, serverAddr: gameData.serverAddr, state: gameData.state });

    switch (gameData.state) {
        case EGameState.Connecting:
            // no easy way to know game state during connection. Likely game in progress, but who actually knows...
            setState(EGameState.Connected, reasonMsg);
            if (!isReadingBacklog && !isManuallyPaused) {
                eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_SERVER_CONNECTED_EVENT_ID, gameData as GameEventData, false);
            }
            break;
        case EGameState.MapChange:
            setState(EGameState.Connected, reasonMsg);
            if (!isReadingBacklog && !isManuallyPaused) {
                eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_MAP_CHANGED_EVENT_ID, gameData as MapEventData, false);
            }
            break;
        case EGameState.Postgame:
            setState(EGameState.Connected, reasonMsg);
            break;
        default:
            logger.warn("Map loaded from an unexpected state!");
            setState(EGameState.Connected, reasonMsg);
            break;
    }

    return true;
};

// ModServices::InitializeModServices()
function handleModServices(lineStr: string): boolean {
    const modUpdateStr = "ModServices::InitializeModServices()";
    if (lineStr !== modUpdateStr) {
        return false;
    }

    // This message is the first indication (aside from some memory leak warnings) that the map is changing
    if (gameData.state === EGameState.Connected || gameData.state === EGameState.Postgame) {
        setState(EGameState.MapChange, "Mod service initializing: map is changing");
        if (!isReadingBacklog && !isManuallyPaused) {
            eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_MAP_CHANGING_EVENT_ID, gameData as ServerEventData, false);
        }
    }
    return true;
};

// Client  : 1284.019531 : Current hive profile data: {1 = "2,966",2 = "439",3 = "-,309",4 = "-,457",5 = "6.283908367157",6 = "1,976",7 = "795",8 = "-,119",9 = "11",10 = "4.3614330291748",11 = "600",12 = "9,797,646",13 = "0",14 = "",15 = "69",16 = "420",17 = "true"}
// Client  : 1284.019531 : New hive profile data: {1 = "2,970",2 = "449",3 = "-,306",4 = "-,453",5 = "6.2839665412903",6 = "1,976",7 = "795",8 = "-,119",9 = "11",10 = "4.3614330291748",11 = "600",12 = "9,797,646",13 = "0",14 = "",15 = "69",16 = "420",17 = "true"}
function handleSkill(lineStr: string, bIsNewSkill: boolean = false): boolean {
    if (!(lineStr.startsWith("Client  : ") && lineStr.includes(" hive profile data: {"))) {
        return false;
    }

    var skillData = deserializeSkillModel(lineStr.substring(lineStr.lastIndexOf('{')), (jstr, err) => {
        logger.error(`Failed to parse skill on line ${lineNum}`, lineStr, jstr, err);
    });
    if (!skillData || skillData == undefined) {
        return false;
    }

    if (lineStr.includes("Current hive profile data: ")) {
        skills.prior.pub = skillData.pub;
        skills.prior.td = skillData.td;
    }
    else if (lineStr.includes("New hive profile data: ")) {
        skills.current.pub = skillData.pub;
        skills.current.td = skillData.td;
        skills.delta = {
            pub: {
                skill: skillData.pub.skill - skills.prior.pub.skill,
                comSkill: skillData.pub.comSkill - skills.prior.pub.comSkill,
                alienSkill: skillData.pub.alienSkill - skills.prior.pub.alienSkill,
                alienComSkill: skillData.pub.alienComSkill - skills.prior.pub.alienComSkill,
                marineSkill: skillData.pub.marineSkill - skills.prior.pub.marineSkill,
                marineComSkill: skillData.pub.marineComSkill - skills.prior.pub.marineComSkill,
            } as SkillData,
            td: {
                skill: skillData.td.skill - skills.prior.td.skill,
                comSkill: skillData.td.comSkill - skills.prior.td.comSkill,
                alienSkill: skillData.td.alienSkill - skills.prior.td.alienSkill,
                alienComSkill: skillData.td.alienComSkill - skills.prior.td.alienComSkill,
                marineSkill: skillData.td.marineSkill - skills.prior.td.marineSkill,
                marineComSkill: skillData.td.marineComSkill - skills.prior.td.marineComSkill,
            } as SkillData,
        } as PairedSkillData;

        if (skills.delta.pub.skill || skills.delta.pub.comSkill || skills.delta.td.skill || skills.delta.td.comSkill) {
            logger.debug(`[L${lineNum}] Skill value updated: change of (${summarizeSkillDataPair(skills.delta, true)}) to (${summarizeSkillDataPair(skills.current)})`);
            if (!isReadingBacklog && !isManuallyPaused) {
                eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_SKILL_UPDATED_EVENT_ID, {
                    playerSkill: skills.current,
                    skillChange: skills.delta,
                } as SkillUpdatedEventData, false);
            }
        }
    }
    else {
        logger.error(`[L${lineNum}] Something went wrong parsing skill data from the text: '${lineStr}'`);
        return false;
    }

    return true;
};

// Steam Id: 1234567890123
function handleSteamId(lineStr: string): boolean {
    const steamIdStr = "Steam Id: ";
    if (!lineStr.startsWith(steamIdStr)) {
        return false;
    }

    var tmpId = lineStr.substring(steamIdStr.length).trim();
    if (!tmpId || tmpId.length < 1) {
        return false;
    }

    // The only reason we're tracking this, is to prevent ugly skill spikes/declines if loading a different user's log file after we've already processed one.
    if (tmpId != steamId && steamId !== "") {
        steamId = tmpId;

        // Not that I personally care, which is why it's solely marked in the log and otherwise entirely ignored.
        logger.warn("You should probably quit smurfing...");

        // Reset all of the skill values to zero to avoid problems...
        clearSkillData();
    }
    return true;
}

// Client  : 1279.340820 : - Marine Team Victory
// Client  : 1504.927124 : - Alien Team Victory
function handleVictory(lineStr: string): boolean {
    const teamVictoryStr = " Team Victory";
    if (!lineStr.startsWith("Client  : ") || !lineStr.endsWith(teamVictoryStr)) {
        return false;
    }

    switch (gameData.state) {
        case EGameState.Unknown:
        case EGameState.Connected:
        case EGameState.Postgame:
            break;
        default:
            logger.warn(`Game state was unexpected (${gameData.state}) for a victory condition`);
            break;
    }
    const teamIdx = lineStr.lastIndexOf('- ') + 2;
    const winner = lineStr.substring(teamIdx, lineStr.length - teamVictoryStr.length).trim().concat('s');
    setState(EGameState.Postgame, `${winner} won on ${gameData.mapName}`);

    if (!isReadingBacklog && !isManuallyPaused) {
        const eventData = {
            gameMode: gameData.gameMode,
            mapName: gameData.mapName,
            serverAddr: gameData.serverAddr,
            serverLocation: gameData.serverLocation,
            serverName: gameData.serverName,
            winningTeam: winner,
        } as RoundCompletedEventData;
        eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_ROUND_COMPLETED_EVENT_ID, eventData, false);
    }
    return true;
};


function setState(newState: EGameState, reason: string): void {
    if (gameData.state !== newState) {
        logger.debug(`[L${lineNum}] ${reason}; ${gameData.state} -> ${newState}`);
        gameData.state = newState;
    }
};


export const ns2Monitor = Object.freeze({
    initialize: async (params: ScriptParams, modules: ScriptModules): Promise<void> => {
        clearSkillData();
        eventManager = modules.eventManager; 
        isReadingBacklog = true;
        lineNumsNeeded = await countLinesInFile(params.logFile);
        buildWatcher(params.logFile);
    },
    destroy: (): void => {
        fileTail?.unwatch();
        isReadingBacklog = true;
        lineNum = 0;
        lineNumsNeeded = 0;
    },
    updateParams: async (params: ScriptParams): Promise<void> => {
        if (!eventManager || eventManager == undefined || !skills || skills == undefined) {
            throw new Error("Unable to updateParams() if initialize() has not been invoked");
        }
        fileTail?.unwatch();
        isReadingBacklog = true;
        lineNumsNeeded = await countLinesInFile(params.logFile);
        buildWatcher(params.logFile);
    },

    pauseEvents: () => { isManuallyPaused = true; },
    resumeEvents: () => { isManuallyPaused = false; },

    getGameMode: () => { return gameData.gameMode; },
    getHasProcessedBacklog: () => { return !isReadingBacklog; },
    getIsPaused: () => { return isManuallyPaused; },
    getMapName: () => { return gameData.mapName; },
    getPlayerPriorSkill: () => { return skills.prior; },
    getPlayerSkill: () => { return skills.current; },
    getPlayerSkillChange: () => { return skills.delta; },
    getServerAddr: () => { return gameData.serverAddr; },
    getServerSteamConnectUri: () => { return getSteamConnectUriFromAddress(gameData.serverAddr); },
    getServerLocation: () => { return gameData.serverLocation; },
    getServerName: () => { return gameData.serverName; },
    getState: () => { return gameData.state; },
});
