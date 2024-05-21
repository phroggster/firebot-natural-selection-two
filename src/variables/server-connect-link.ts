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

import { ns2Monitor } from "../ns2-monitor";
import { getSteamConnectUriFromAddress } from "../types/game-data";

// Discord, Twitch, even Visual Studio's MarkDown editor refuse to URL-ify steam protocol links. /me casts shame.

const model: ReplaceVariable = {
    definition: {
        handle: "ns2ServerConnectLink",
        description: "Returns an URL to automatically connect someone to the Natural Selection 2 game server. Note that neither Discord nor Twitch make these URLs clickable.",
        possibleDataOutput: ["text"],
    },
    evaluator: async (trigger): Promise<string> => {
        return getSteamConnectUriFromAddress(trigger.metadata.eventData?.serverAddr as string)
            ?? ns2Monitor.getServerSteamConnectUri()
            ?? "unknown";
    },
};

export default model;
