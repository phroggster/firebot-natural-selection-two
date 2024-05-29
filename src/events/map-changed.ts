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

import {
    NS2_EXAMPLE_GAME_MODE,
    NS2_EXAMPLE_MAP_NAME,
    NS2_EXAMPLE_SERVER_ADDR,
    NS2_EXAMPLE_SERVER_LOC,
    NS2_EXAMPLE_SERVER_NAME,
    NS2_MAP_CHANGED_EVENT_ID,
} from "../constants";
import { EventDefinition } from "../types";

const model: EventDefinition = {
    id: NS2_MAP_CHANGED_EVENT_ID,
    name: "Map Changed",
    description: "When the map has been changed",
    manualMetadata: {
        gameMode: NS2_EXAMPLE_GAME_MODE,
        mapName: NS2_EXAMPLE_MAP_NAME,
        serverAddr: NS2_EXAMPLE_SERVER_ADDR,
        serverLocation: NS2_EXAMPLE_SERVER_LOC,
        serverName: NS2_EXAMPLE_SERVER_NAME,
    },
};

export default model;
