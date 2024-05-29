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
import axios from "axios";
import { compareSemVer, isValidSemVer, parseSemVer } from 'semver-parser';

import {
    GITHUB_LATEST_RELEASE_API,
    GITHUB_LATEST_RELEASE_URI,
    PLUGIN_VERSION_ID,
} from "./constants";
import { logger } from "./logger";
import { GithubReleaseData, ScriptParams } from "./types";
import { SemVerObject } from "semver-parser/types/modules/semver";

let bHasCheckedForUpdate: boolean = false;
let bIsUpdateAvailable: boolean = false;
let modules: ScriptModules;

/**
 * Raises an alert in the main chat feed about an update available for the plugin.
 * @param currentVersion The current version of the plugin.
 * @param availableVersion The freshly-available version number of the plugin.
 * @param releaseUrl (Optional; default `null`) A URL pointing to the naturalSelectionTwoFirebot.js release asset.
 */
async function alertUpdateAvailable(currentVersion: string, availableVersion: string, releaseUrl: string | null | undefined = null): Promise<void> {
    // TODO: update this once the `chat-alert-markdown` branch gets merged upstream, and their update gets deployed.
    const bIsMarkupAvailable = false;
    const curVerMarkup = bIsMarkupAvailable ? `*${currentVersion}*` : currentVersion;
    const newVerMarkup = bIsMarkupAvailable ? `*${availableVersion}*` : availableVersion;
    const updateUrl = bIsMarkupAvailable && typeof releaseUrl === "string" && releaseUrl.length ? `*<${releaseUrl}>*` : GITHUB_LATEST_RELEASE_URI;
    const { effectManager } = modules;

    type ChatAlertModel = {
        message: string;
    };
    const effect = effectManager.getEffectById<ChatAlertModel>("firebot:chat-feed-alert");
    if (!effect || !effect.onTriggerEvent) {
        logger.error("Unable to locate the chat-feed-alert effect");
        return;
    }
    await effect.onTriggerEvent({
        effect: {
            message: `An update is available for the the Natural Selection 2 plugin: ${curVerMarkup} -> ${newVerMarkup}.  Visit ${updateUrl} to update.`
        },
        trigger: {
            type: "custom_script",
            metadata: {
                username: "script"
            }
        },
        sendDataToOverlay: () => { }
    });
};

/**
 * Parses a version number from a GithubReleaseData, returning either the version number if found, or null.
 * @param data A GithubReleaseData containing information about a project release.
 * @returns A version number representing the release, or null if one could not be found.
 */
function tryParseVersionFromRelease(data: GithubReleaseData): SemVerObject | null {
    if (data.tag_name && data.tag_name.length > 0 && isValidSemVer(data.tag_name, false)) {
        return parseSemVer(data.tag_name, false);
    }

    if (data.name && data.name.length > 0 && isValidSemVer(data.name, false)) {
        return parseSemVer(data.name, false);
    }

    logger.warn(`Failed to parse a release version number, tag is ${data.tag_name}, name is ${data.name}`);
    return null;
};

/**
 * Checks for an available update to the plugin, and displays an alert if one is available.
 * @returns `true` if an update is available; `false` otherwise.
 */
async function runUpdateCheckAndAlert(): Promise<boolean> {
    const curVer = parseSemVer(PLUGIN_VERSION_ID);
    if (!curVer || curVer === null) {
        logger.error('Failed to parse current plugin version');
        return false;
    }

    let releaseInfo: GithubReleaseData;
    try {
        const response = await axios.get<GithubReleaseData>(GITHUB_LATEST_RELEASE_API, {
            headers: {
                "Accept": "application/vnd.github+json", // "application/json"
                "X-GitHub-Api-Version": "2022-11-28",
            }
        });
        if (!response.data) {
            logger.warn(`Failed to get update information from Github, status code ${response.status}: ${response.statusText}`, response);
            return false;
        }
        releaseInfo = response.data;
    }
    catch (err) {
        logger.warn("Error while trying to check Github for updates", err);
        return false;
    }

    const newVer = tryParseVersionFromRelease(releaseInfo);
    if (!newVer) {
        logger.warn(`Unable to parse version number from Github release`, releaseInfo);
        return false;
    }

    if (compareSemVer(newVer.version, curVer.version, false) <= 0) {
        return false;
    }

    if (modules.twitchChat.chatIsConnected) {
        logger.debug("Raising update available alert now");
        await alertUpdateAvailable(curVer.version, newVer.version, releaseInfo.assets.find((asset) => asset.name === "naturalSelectionTwoFirebot.js")?.browser_download_url);
    } else {
        logger.debug("Queueing update available alert for chat to be connected");
        modules.twitchChat.on("connected", async () => {
            await alertUpdateAvailable(curVer.version, newVer.version, releaseInfo.assets.find((asset) => asset.name === "naturalSelectionTwoFirebot.js")?.browser_download_url);
        });
    }
    return true;
};


const updateChecker = Object.freeze({
    initialize: async (modulesParam: ScriptModules, params: ScriptParams): Promise<void> => {
        modules = modulesParam;

        if (params.updateChecks) {
            bHasCheckedForUpdate = true;
            try {
                bIsUpdateAvailable = await runUpdateCheckAndAlert();
            }
            catch (err) {
                logger.error("Error running UpdateCheckAndAlert during initialization", err);
            }
        }
    },
    updateSettings: async (params: ScriptParams): Promise<void> => {
        if (!bHasCheckedForUpdate && params.updateChecks) {
            bHasCheckedForUpdate = true;
            try {
                bIsUpdateAvailable = await runUpdateCheckAndAlert();
            }
            catch (err) {
                logger.error("There was an error while checking for updates", err);
            }
        }
    },

    hasCheckedForAnUpdate: () => { return bHasCheckedForUpdate; },
    isUpdateAvailable: () => { return bIsUpdateAvailable; },
});

export default updateChecker;
