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

/** The parameters to our script, controllable from the "Startup Scripts" edit page in Firebot settings. */
export interface ScriptParams {
    /** The path to the NS2 application log file on disk. */
    logFile: string;
};

/** An enum representing the possible states of an NS2 game session. */
export enum EGameState {
    /** Main menu, single-player, or an otherwise indertiminate state. */
    Unknown = "Unknown",
    /** Attempting to connect to a game server. */
    Connecting = "Connecting",
    /** Connected to a game server, but in an otherwise indeterminate state. */
    Connected = "Connected",
    /** Game over man, game over! Either map change or open play should be coming next. */
    Postgame = "Postgame",
    /** On to the next map. */
    MapChange = "MapChange",
};

/** An object containing information about an NS2 game session. */
export interface GameData extends GameEventData, MapEventData, ServerEventData {
    state: EGameState;
};

/** Information about a player's skill in both play environents. */
export interface PairedSkillData {
    pub: SkillData;
    td: SkillData;
};

/** Information about a player's skill for a given play environment. */
export interface SkillData {
    skill: number;
    comSkill: number;
    alienSkill: number;
    alienComSkill: number;
    marineSkill: number;
    marineComSkill: number;
};


/** Information about a game event. Includes both server and map information. */
export type GameEventData = MapEventData & ServerEventData;

/** Information about a map change event. */
export type MapEventData = {
    gameMode: string;
    mapName: string;
};

/** Information about a team victory event. */
export type RoundCompletedEventData = GameEventData & {
    winningTeam: string;
};

/** Information about a server event. */
export type ServerEventData = {
    serverAddr: string;
    serverLocation: string;
    serverName: string;
};

/** Information about a skill update event. */
export type SkillUpdatedEventData = {
    playerSkill: PairedSkillData;
    skillChange: PairedSkillData;
};
