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

import { NS2_EVENT_SOURCE_ID } from "./constants";
import { initLogger, logger } from "./logger";
import { ns2Monitor } from "./ns2-monitor";
import { ScriptParams } from "./types";
import ns2Effects from "./effects/index";
import ns2Events from "./events/index";
import ns2Variables from "./variables/index";

const script: Firebot.CustomScript<ScriptParams> = {
    getScriptManifest: () => {
        return {
            name: "Natural Selection 2 Integration",
            description: "Adds Natural Selection 2 application events and variables to Firebot",
            author: "phroggie",
            version: "0.0.3",
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
        };
    },
    parametersUpdated: async (parameters) => {
        await ns2Monitor.updateParams(parameters);
    },
    run: async (runRequest) => {
        const { modules, parameters } = runRequest;
        let result: ScriptReturnObject = {
            // callback: scriptStartupCallback,
            effects: [],
            errorMessage: '',
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

        // And lastly, the glue to bind it all together
        try {
            await ns2Monitor.initialize(parameters, modules);
        }
        catch (err) {
            logger.error("Error while initializing monitor", err);
            result.errorMessage = `${err}`;
            result.success = false;
        }

        logger.info("Plugin initialization complete");
        return result;
    },
    stop: () => {
        logger.info("Stopping Natural Selection 2 plugin: nop");
        ns2Monitor.destroy();
        // TODO: There's no way to detach from anything else that we're using, besides perhaps the logger.
        // detachLogger();
    },
};

export default script;
