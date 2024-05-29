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

import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import ns2Monitor from "../ns2-monitor";

const PauseEventsEffectType: Effects.EffectType<never> = {
    definition: {
        id: "ns2:pause-events",
        name: "Natural Selection 2: Pause events",
        description: "Stops NS2 events from being raised",
        icon: "fad fa-bell-slash", // or fa-pause-circle
        categories: ["integrations"],
    },
    optionsTemplate: "",
    optionsController: () => { },
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        ns2Monitor.pauseEvents();
        return true;
    }
};

export default PauseEventsEffectType;
