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
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

import { logger } from "../logger";
import { ns2Monitor } from "../ns2-monitor";
import { PairedSkillData, SkillUpdatedEventData } from "../types";
import { summarizeSkillData, summarizeSkillDataPair } from "../types/skill-data";

const model: ReplaceVariable = {
    definition: {
        handle: "ns2SkillChange",
        description: "Returns information about a player's most recent skill change in Natural Selection 2.",
        examples: [
            {
                usage: "ns2SkillChange",
                description: "A brief textual summary of the player's most recent overall skill value change."
            },
            {
                usage: "ns2SkillChange[summary]",
                description: "A brief textual summary of the player's most recent overall skill value change."
            },
            {
                usage: "ns2SkillChange[pub]",
                description: "A brief textual summary of the player's most recent overall skill value change in pubs."
            },
            {
                usage: "ns2SkillChange[skill]",
                description: "The player's most recent overall skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[com]",
                description: "The player's most recent overall commander skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[alien]",
                description: "The player's most recent alien team skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[alienCom]",
                description: "The player's most recent alien commander skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[marine]",
                description: "The player's most recent marine team skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[marineCom]",
                description: "The player's most recent marine commander skill value change in pubs as a number."
            },
            {
                usage: "ns2SkillChange[td]",
                description: "A brief textual summary of the player's most recent overall skill value change in ThunderDome."
            },
            {
                usage: "ns2SkillChange[tdskill]",
                description: "The player's most recent overall skill value change in ThunderDome as a number."
            },
            {
                usage: "ns2SkillChange[tdCom]",
                description: "The player's most recent overall commander skill value change in ThunderDome as a number."
            },
            {
                usage: "ns2SkillChange[tdAlien]",
                description: "The player's most recent alien team skill value change in ThunderDome as a number."
            },
            {
                usage: "ns2SkillChange[tdAlienCom]",
                description: "The player's most recent alien commander skill value change in ThunderDome as a number."
            },
            {
                usage: "ns2SkillChange[tdMarine]",
                description: "The player's most recent marine team skill value change in ThunderDome as a number."
            },
            {
                usage: "ns2SkillChange[tdMarineCom]",
                description: "The player's most recent marine commander skill value change in ThunderDome as a number."
            },
        ],
        possibleDataOutput: ["number", "text"],
    },
    evaluator: async (trigger: Effects.Trigger, valueSelector: string, ...extra: any[]): Promise<number|string> => {
        const allowedValues = [
            "pub", "skill", "com", "alien", "marine", "aliencom", "marinecom",
            "td", "tdskill", "tdcom", "tdalien", "tdmarine", "tdaliencom", "tdmarinecom",
            "summary"
        ];
        const defaultSelector = "summary";
        valueSelector = valueSelector == null ? defaultSelector : valueSelector.trim().toLowerCase();
        if (valueSelector === '' || allowedValues.findIndex(v => v === valueSelector) < 0) {
            if (valueSelector !== '') {
                logger.warn(`Unknown skillChange variable value selector ${valueSelector}, defaulting to ${defaultSelector}`);
            }
            valueSelector = defaultSelector;
        }

        const skillChange = (trigger.metadata?.eventData as SkillUpdatedEventData)?.skillChange as PairedSkillData
            ?? ns2Monitor.getPlayerSkillChange();

        switch (valueSelector) {
            case "summary":
                return summarizeSkillDataPair(skillChange, true) ?? "unknown";

            case "pub":
                return summarizeSkillData(skillChange.pub, true) ?? "unknown";
            case "skill":
                return skillChange?.pub?.skill ?? 0;
            case "com":
                return skillChange?.pub?.comSkill ?? 0;
            case "alien":
                return skillChange?.pub?.alienSkill ?? 0;
            case "marine":
                return skillChange?.pub?.marineSkill ?? 0;
            case "aliencom":
                return skillChange?.pub?.alienComSkill ?? 0;
            case "marinecom":
                return skillChange?.pub?.marineComSkill ?? 0;

            case "td":
                return summarizeSkillData(skillChange.td, true) ?? "unknown";
            case "tdskill":
                return skillChange?.td?.skill ?? 0;
            case "tdcom":
                return skillChange?.td?.comSkill ?? 0;
            case "tdalien":
                return skillChange?.td?.alienSkill ?? 0;
            case "tdmarine":
                return skillChange?.td?.marineSkill ?? 0;
            case "tdaliencom":
                return skillChange?.td?.alienComSkill ?? 0;
            case "tdmarinecom":
                return skillChange?.td?.marineComSkill ?? 0;
        }

        return 0;
    },
};

export default model;
