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

export let logger = {
    debug: (msg: string, ...meta: any[]) => { },
    info: (msg: string, ...meta: any[]) => { },
    warn: (msg: string, ...meta: any[]) => { },
    error: (msg: string, ...meta: any[]) => { },
};

export function initLogger(modules: ScriptModules) {
    logger = {
        debug: (msg: string, ...meta: any[]) => { modules.logger.debug(`ns2: ${msg}`, meta); },
        info: (msg: string, ...meta: any[]) => { modules.logger.info(`ns2: ${msg}`, meta); },
        warn: (msg: string, ...meta: any[]) => { modules.logger.warn(`ns2: ${msg}`, meta); },
        error: (msg: string, ...meta: any[]) => { modules.logger.error(`ns2: ${msg}`, meta); },
    };
};

export function detachLogger() {
    logger = {
        debug: () => { },
        info: () => { },
        warn: () => { },
        error: () => { },
    };
};
