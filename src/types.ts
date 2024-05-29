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
    /** Whether auto-update checks are enabled for the Natural Selection 2 Firebot plugin. */
    updateChecks: boolean;
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


export interface ApplyUpdateEffectModel {
    downloadUrl: string;
    fileName: string;
    scriptsFolder: string;
};

export type AnyEventData =
    GameEventData |
    MapEventData |
    RoundCompletedEventData |
    ServerEventData |
    SkillUpdatedEventData |
    UpdateAvailableEventData;

/** The type needed by Firebot to register an event source. */
export type EventDefinition = {
    id: string,
    name: string,
    description: string,
    manualMetadata?: AnyEventData,
};

/** Information about a game event. Includes both server and map information. */
export type GameEventData = MapEventData & ServerEventData;

/** Information about a map change event. */
export type MapEventData = {
    gameMode: string;
    mapName: string;
};

/** Information about a round completed event. */
export type RoundCompletedEventData = GameEventData & MapEventData & {
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

/** Information about an update to this software. */
export type UpdateAvailableEventData = {
    availableVersion: string;
    currentVersion: string;
    directUrl: string;
    releaseUrl: string;
};

// https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
/*
export enum EGithubAssetState {
    open = "open",
    uploaded = "uploaded",
}

export type GithubUser = {
    login: string,
    id: number,
    node_id: string,
    avatar_url: string,
    gravatar_id: string | null,
    url: string,
    html_url: string,
    followers_url: string,
    following_url: string,
    gists_url: string,
    starred_url: string,
    subscriptions_url: string,
    organizations_url: string,
    repos_url: string,
    events_url: string,
    received_events_url: string,
    type: string,
    site_admin: boolean,

    name?: string | null,
    email?: string | null,
    starred_at?: string,
}

export type GithubAsset = {
    url: string,
    id: number,
    node_id: string,
    name: string,
    label: string | null,
    state: string, // EAssetState, // string,
    content_type: string,
    size: number,
    download_count: number,
    created_at: string,
    updated_at: string,
    uploader: GithubUser | null,

    browser_download_url?: string,
}

export type GithubReleaseData = {
    url: string,
    assets_url: string,
    upload_url: string,
    html_url: string,
    id: number,
    author: GithubUser | undefined,
    node_id: string,
    tag_name: string,
    target_commitish: string,
    name: string,
    draft: boolean,
    prerelease: boolean,
    created_at: string,
    published_at: string,
    assets: Array<GithubAsset> | undefined,
    tarball_url: string,
    zipball_url: string,

    body: string | null,
    discussion_url: string | null,

    body_html: string | null,
    body_text: string | null,
    mentions_count: number | null,
    reactions: {
        url?: string,
        total_count?: number,
        '+1'?: number,
        '-1'?: number,
        laugh?: number,
        confused?: number,
        heart?: number,
        hooray?: number,
        eyes?: number,
        rocket?: number,
    } | null
};
*/

export type GithubReactionRollup = {
    url: string;
    total_count: number;
    confused: number;
    eyes: number;
    heart: number;
    hooray: number;
    laugh: number;
    rocket: number;
    "+1": number;
    "-1": number;
};

export type GithubReleaseAssetData = {
    url: string;
    id: number;
    node_id: string;
    /** The file name of the asset. */
    name: string;
    label: string | null;
    uploader: GithubUserData | null;
    content_type: string;
    /** State of the release asset. */
    state: "uploaded" | "open";
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
};

export type GithubReleaseData = {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: GithubUserData;
    node_id: string;
    /** The name of the tag. */
    tag_name: string;
    /** The commitish value which the release was created from. */
    target_commitish: string;
    name: string | null;
    /** `true` if the release is a draft (unpublished) release; `false` if it's a published one. */
    draft: boolean;
    /** Whether to identify the release as a prerelease or a full release. */
    prerelease: boolean;
    created_at: string;
    published_at: string | null;
    assets: GithubReleaseAssetData[];
    tarball_url: string | null;
    zipball_url: string | null;
    body?: string | null;
    /** The URL of the release discussion. */
    discussion_url?: string;

    body_html?: string;
    body_text?: string;
    mentions_count?: number;
    reactions?: GithubReactionRollup;
};

export type GithubUserData = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    email?: string | null;
    name?: string | null;
    starred_at?: string;
};
