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

import { NS2_SKILL_UPDATED_EVENT_ID } from "../constants";
import { SkillUpdatedEventData } from "../types";

const model = {
    id: NS2_SKILL_UPDATED_EVENT_ID,
    name: "Skill Updated",
    description: "When player's skill information has been updated",
    manualMetadata: {
        // what a noob.
        playerSkill: {
            pub: {
                skill: 500,
                comSkill: 400,
                alienSkill: 250,
                alienComSkill: 200,
                marineSkill: 750,
                marineComSkill: 600,
            },
            td: {
                skill: 100,
                comSkill: 200,
                alienSkill: 50,
                alienComSkill: 25,
                marineSkill: 150,
                marineComSkill: 75,
            }
        },
        // values similar to a 75% alien com, 25% skulk victory on a pub server
        skillChange: {
            pub: {
                skill: 3,
                comSkill: 9,
                alienSkill: 6,
                alienComSkill: 18,
                marineSkill: 0,
                marineComSkill: 0,
            },
            td: {
                skill: 0,
                comSkill: 0,
                alienSkill: 0,
                alienComSkill: 0,
                marineSkill: 0,
                marineComSkill: 0,
            }
        },
    } as SkillUpdatedEventData,
};

export default model;
