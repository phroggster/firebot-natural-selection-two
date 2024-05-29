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

import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

import ns2Monitor from "../ns2-monitor";
import { getServerNameFromAddress } from "../types/game-data";

const model: ReplaceVariable = {
    definition: {
        handle: "ns2ServerName",
        description: "Returns the short name of the Natural Selection 2 server that the player is connected to, or was most recently connected to.",
        possibleDataOutput: ["text"],
    },
    evaluator: async (trigger): Promise<string> => {
        return getServerNameFromAddress(trigger.metadata.eventData?.serverAddr as string)
            ?? ns2Monitor.getServerName()
            ?? "unknown";
    },
};

export default model;
