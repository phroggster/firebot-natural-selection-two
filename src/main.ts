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

import { Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";

import { NS2_EVENT_SOURCE_ID, PLUGIN_VERSION_ID } from "./constants";
import ns2Effects from "./effects";
import ns2Events from "./events";
import { destroyLogger, initLogger, logger } from "./logger";
import ns2Monitor from "./ns2-monitor";
import { ScriptParams } from "./types";
import updateChecker from "./update-checker";
import ns2Variables from "./variables";

const ns2Script: Firebot.CustomScript<ScriptParams> = {
    getScriptManifest: async () => {
        return {
            name: "Natural Selection 2 Integration",
            description: "Adds Natural Selection 2 application events and variables to Firebot",
            author: "phroggie",
            version: PLUGIN_VERSION_ID,
            firebotVersion: "5",
            startupOnly: true,
        };
    },
    getDefaultParameters: () => {
        return {
            logFile: {
                type: "filepath",
                default: `${process.env.APPDATA}\\Natural Selection 2\\log.txt`,
                description: "Natural Selection 2 Log File",
                secondaryDescription: "",
                fileOptions: {
                    directoryOnly: false,
                    filters: [
                        { name: "Text Files", extensions: ["txt"] },
                        { name: "Log Files", extensions: ["log"] },
                        { name: "All Files", extensions: ["*"] },
                    ],
                    title: "Select NS2 Log File",
                    buttonLabel: "Open",
                },
            },
            updateChecks: {
                type: "boolean",
                default: true,
                description: "Enable automatic update checks",
                secondaryDescription: "Script will check for updates during startup, and notify you when one is available",
            },
        };
    },
    parametersUpdated: async (scriptParams) => {
        await ns2Monitor.updateSettings(scriptParams);
        await updateChecker.updateSettings(scriptParams);
    },
    run: async (runRequest) => {
        const { modules, parameters } = runRequest;
        const result: ScriptReturnObject = {
            callback: undefined,
            effects: [],
            errorMessage: undefined,
            success: true,
        };

        initLogger(modules);
        logger.info("Initializing Natural Selection 2 plugin");

        // Events
        try {
            modules.eventManager.registerEventSource({
                id: NS2_EVENT_SOURCE_ID,
                name: "Natural Selection 2",
                events: ns2Events,
            });
        } catch (err) {
            // Not treated as an error
            logger.warn("Error while registering event source: likely already registered, skipping", err);
        }

        // ReplaceVariables
        for (const variable of ns2Variables) {
            try {
                modules.replaceVariableManager.registerReplaceVariable(variable);
            } catch (err) {
                // Not treated as an error
                logger.warn(`Error while registering variable $${variable.definition.handle}: likely already registered, skipping`, err);
            }
        }

        // Effects
        for (const effect of ns2Effects) {
            try {
                modules.effectManager.registerEffect(effect);
            }
            catch (err) {
                // Not treated as an err
                logger.warn(`Error while registering effect ${effect.definition.id}; likely already registered, skipping`, err);
            }
        }

        // Update checker
        try {
            await updateChecker.initialize(modules, parameters);
        }
        catch (err) {
            logger.warn("Error initializing auto-update checks for the NS2 integration plugin", err);
        }

        // The actual stuff that we care about
        try {
            await ns2Monitor.initialize(parameters, modules);
        }
        catch (err) {
            logger.error("Error while initializing monitor", err);
            result.errorMessage = `${err}`;
            result.success = false;
        }

        logger.info("Done with plugin initialization");
        return result;
    },
    stop: async () => {
        logger.info("Stopping Natural Selection 2 plugin");
        await ns2Monitor.destroy();
        // TODO: There's no way to detach from anything else that we're using, besides perhaps the logger.
        destroyLogger();
    },
};

export default ns2Script;
