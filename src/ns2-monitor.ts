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

import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import split2 from "split2";
import TailFile from "@logdna/tail-file";

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
    SkillData,
    SkillUpdatedEventData,
} from "./types";
import { getSteamConnectUriFromAddress, inflateGameInfoData } from "./types/game-data";
import { deserializeSkillModel, summarizeSkillDataPair } from "./types/skill-data";

type SkillDatas = {
    current: PairedSkillData;
    prior: PairedSkillData;
    delta: PairedSkillData;
};

let eventManager: ScriptModules["eventManager"];
let gameData = {
    gameMode: "unknown",
    mapName: "unknown",
    serverAddr: "none",
    serverLocation: "unknown",
    serverName: "unknown",
    state: EGameState.Unknown
} as GameData;
let isManuallyPaused: boolean = false;
let isReadingBacklog: boolean = true;
let lineNum: number = 0;
let skills: SkillDatas = getEmptySkills();
let steamId: string = "";
let watcher: TailFile;

type RenameOrTruncEvtData = { message: string, filename: string, when: Date };
type RetryData = { message: string, filename: string, attempts: number, when: Date };
type TailError = Error & {
    code: string | undefined,
    meta: {
        actual: Error | undefined,
        code: string | undefined,
        error: string | undefined,
    } | undefined,
};

async function buildWatcher(pathToLogFile: string): Promise<TailFile> {
    const tail = new TailFile(pathToLogFile, {
        encoding: "utf8",
        pollFileIntervalMs: 625,
        startPos: 0,
    });
    await tail.on("close", () => {
        logger.debug("TailFile is closing the file, and probably shutting down");
    }).on("error", (err: Error) => {
        // error in one of our listeners, most likely
        logger.error("TailFile.error received", err);
        throw err;
    }).on("flush", (/*lastReadPosition: number*/) => {
        // eof reached during read
        isReadingBacklog = false;
    }).on("tail_error", (err: TailError) => {
        // err in TailFile or our usage of it
        logger.error(`TailFile.tail_error received (${err.code || err.meta?.code || "(unknown)"}): ${err.message || err.meta?.actual?.message || "(unknown)"}`, err);
        throw err;
    }).on("renamed", (data: RenameOrTruncEvtData) => {
        // logrotate
        logger.debug(`TailFile.renamed received: ${data.message}`);
        isReadingBacklog = false;
        // are we following the new file or the old one here?
    }).on("retry", (data: RetryData) => {
        logger.debug(`TailFile.retry received: ${data.message}`);
        // logrotate, but no new file yet.
        // just ignore it...
    }).on("truncated", (data: RenameOrTruncEvtData) => {
        logger.debug(`TailFile.truncated received, assuming logs are rotating: ${data.message}`);
        isReadingBacklog = false;
        lineNum = 0;
    }).start()
        .catch((err) => {
            logger.error("TailFile.start.error, does the file exist?", err);
        });

    tail.pipe(split2())
        .on("data", (line) => {
            lineNum++;
            if (!(handleConnecting(line) || handleMapLoaded(line) || handleModServices(line) || handleSkill(line) || handleSteamId(line) || handleVictory(line))) {
                // Re-enable this if ever needing to verify line-splitting, or while porting to BSD or Linux or something.
                // logger.debug(`Ignoring log line: ${line}`);
            }
        });

    return tail;
};

function getEmptySkills(): SkillDatas {
    return {
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
    } as SkillDatas;
};

function handleConnecting(lineStr: string): boolean {
    // [ 31.025] MainThread : Connecting to server 12.34.56.78:90123
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

function handleMapLoaded(lineStr: string): boolean {
    // Finished loading 'maps/ns2_descent.level'
    const mapLoadedStr = "Finished loading 'maps/";
    if (!lineStr.startsWith(mapLoadedStr)) {
        return false;
    }

    const oldState = gameData.state;
    let mapNameStr = lineStr.substring(lineStr.indexOf(mapLoadedStr) + mapLoadedStr.length);
    mapNameStr = mapNameStr.substring(0, mapNameStr.lastIndexOf(".level'"));
    gameData = inflateGameInfoData({ mapName: mapNameStr, serverAddr: gameData.serverAddr, state: gameData.state });

    setState(EGameState.Connected, `Loaded map ${mapNameStr}`);
    if (!isReadingBacklog && !isManuallyPaused) {
        switch (oldState) {
            case EGameState.Connecting:
                eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_SERVER_CONNECTED_EVENT_ID, gameData as GameEventData, false);
                break;
            case EGameState.MapChange:
                eventManager.triggerEvent(NS2_EVENT_SOURCE_ID, NS2_MAP_CHANGED_EVENT_ID, gameData as MapEventData, false);
                break;
            default:
                break;
        }
    }

    return true;
};

function handleModServices(lineStr: string): boolean {
    // ModServices::InitializeModServices()
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

function handleSkill(lineStr: string): boolean {
    // Client  : 1284.019531 : Current hive profile data: {1 = "2,966",2 = "439",3 = "-,309",4 = "-,457",5 = "6.283908367157",6 = "1,976",7 = "795",8 = "-,119",9 = "11",10 = "4.3614330291748",11 = "600",12 = "9,797,646",13 = "0",14 = "",15 = "69",16 = "420",17 = "true"}
    // Client  : 1284.019531 : New hive profile data: {1 = "2,970",2 = "449",3 = "-,306",4 = "-,453",5 = "6.2839665412903",6 = "1,976",7 = "795",8 = "-,119",9 = "11",10 = "4.3614330291748",11 = "600",12 = "9,797,646",13 = "0",14 = "",15 = "69",16 = "420",17 = "true"}
    if (!(lineStr.startsWith("Client  : ") && lineStr.includes(" hive profile data: {"))) {
        return false;
    }

    const skillData = deserializeSkillModel(lineStr.substring(lineStr.lastIndexOf('{')), (jstr, err) => {
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

function handleSteamId(lineStr: string): boolean {
    // Steam Id: 1234567890123
    const steamIdStr = "Steam Id: ";
    if (!lineStr.startsWith(steamIdStr)) {
        return false;
    }

    const tmpId = lineStr.substring(steamIdStr.length).trim();
    if (!tmpId || tmpId.length < 1) {
        return false;
    }

    // The only reason we're tracking this, is to prevent ugly skill spikes/declines if loading a different user's log file after we've already processed one.
    if (tmpId != steamId && steamId !== "") {
        steamId = tmpId;

        // Not that I personally care, which is why it's solely marked in the log and otherwise entirely ignored.
        logger.warn("You should probably quit smurfing...");

        // Reset all of the skill values to zero to avoid problems...
        skills = getEmptySkills();
    }

    return true;
}

function handleVictory(lineStr: string): boolean {
    // Client  : 1279.340820 : - Marine Team Victory
    // Client  : 1504.927124 : - Alien Team Victory
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
    let winner = lineStr.substring(teamIdx);
    winner = winner.substring(0, winner.length - teamVictoryStr.length).concat('s');
    setState(EGameState.Postgame, `${winner} won on ${gameData.mapName}`);

    if (!isReadingBacklog && !isManuallyPaused) {
        const eventData: RoundCompletedEventData = {
            gameMode: gameData.gameMode,
            mapName: gameData.mapName,
            serverAddr: gameData.serverAddr,
            serverLocation: gameData.serverLocation,
            serverName: gameData.serverName,
            winningTeam: winner,
        };
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

const ns2Monitor = Object.freeze({
    initialize: async (params: ScriptParams, modules: ScriptModules): Promise<void> => {
        eventManager = modules.eventManager;
        watcher = await buildWatcher(params.logFile);
    },
    destroy: async (): Promise<void> => {
        await watcher?.quit();
    },
    updateSettings: async (params: ScriptParams): Promise<void> => {
        if (!eventManager || eventManager == undefined) {
            throw new Error("Unable to updateParams() if initialize() has not been invoked");
        }
        await watcher?.quit();
        isReadingBacklog = true;
        watcher = await buildWatcher(params.logFile);
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

export default ns2Monitor;
