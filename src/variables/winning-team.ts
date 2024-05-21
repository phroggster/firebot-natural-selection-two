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
import { NS2_EVENT_SOURCE_ID, NS2_ROUND_COMPLETED_EVENT_ID } from "../constants";
import { RoundCompletedEventData } from "../types";

const model: ReplaceVariable = {
    definition: {
        handle: "ns2WinningTeam",
        description: "Returns the name of the team that won the game round in Natural Selection 2.",
        possibleDataOutput: ["text"],
        triggers: {
            event: [
                `${NS2_EVENT_SOURCE_ID}:${NS2_ROUND_COMPLETED_EVENT_ID}`
            ],
            // TOODO: Not sure what this value needs to actually be...
            manual: true,
        }
    },
    evaluator: async (trigger): Promise<string> => {
        // ns2monitor doesn't retain a winning team value, as it's a strictly ephemeral variable.
        return (trigger.metadata.eventData as RoundCompletedEventData)?.winningTeam ?? "unknown (tied?)";
    },
};

export default model;
