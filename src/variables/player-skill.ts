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
import { PairedSkillData } from "../types";
import { summarizeSkillData, summarizeSkillDataPair } from "../types/skill-data";

const model: ReplaceVariable = {
    definition: {
        handle: "ns2PlayerSkill",
        description: "Returns information about a player's skill in Natural Selection 2.",
        examples: [
            {
                usage: "ns2PlayerSkill",
                description: "Returns a brief textual summary of the player's skill level."
            },
            {
                usage: "ns2PlayerSkill[summary]",
                description: "Returns a brief textual summary of the player's skill level."
            },
            {
                usage: "ns2PlayerSkill[pub]",
                description: "Returns a brief textual summary of the player's skill level in pubs."
            },
            {
                usage: "ns2PlayerSkill[skill]",
                description: "Returns the player's overall skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[com]",
                description: "Returns the player's overall commander skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[alien]",
                description: "Returns the player's alien team skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[aliencom]",
                description: "Returns the player's alien commander skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[marine]",
                description: "Returns the player's marine team skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[marinecom]",
                description: "Returns the player's marine commander skill value in pubs."
            },
            {
                usage: "ns2PlayerSkill[td]",
                description: "Returns a brief textual summary of the player's skill level in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdskill]",
                description: "Returns the player's overall skill value in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdcom]",
                description: "Returns the player's overall commander skill value in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdalien]",
                description: "Returns the player's alien team skill value in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdaliencom]",
                description: "Returns the player's alien commander skill value in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdmrine]",
                description: "Returns the player's marine team skill value in ThunderDome."
            },
            {
                usage: "ns2PlayerSkill[tdmarinecom]",
                description: "Returns the player's marine commander skill value in ThunderDome."
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
                logger.warn(`Unknown playerSkill variable value selector ${valueSelector}, defaulting to ${defaultSelector}`);
            }
            valueSelector = defaultSelector;
        }

        const skill = trigger.metadata.eventData?.playerSkill as PairedSkillData
            ?? ns2Monitor.getPlayerSkill();
        switch (valueSelector) {
            case "summary":
                return summarizeSkillDataPair(skill, false) ?? "unknown";

            case "pub":
                return summarizeSkillData(skill.pub, false) ?? "unknown";
            case "skill":
                return skill?.pub?.skill ?? 0;
            case "com":
                return skill?.pub?.comSkill ?? 0;
            case "alien":
                return skill?.pub?.alienSkill ?? 0;
            case "marine":
                return skill?.pub?.marineSkill ?? 0;
            case "aliencom":
                return skill?.pub?.alienComSkill ?? 0;
            case "marinecom":
                return skill?.pub?.marineComSkill ?? 0;

            case "td":
                return summarizeSkillData(skill.td, false) ?? "unknown";
            case "tdskill":
                return skill?.td?.skill ?? 0;
            case "tdcom":
                return skill?.td?.comSkill ?? 0;
            case "tdalien":
                return skill?.td?.alienSkill ?? 0;
            case "tdmarine":
                return skill?.td?.marineSkill ?? 0;
            case "tdaliencom":
                return skill?.td?.alienComSkill ?? 0;
            case "tdmarinecom":
                return skill?.td?.marineComSkill ?? 0;
            default:
                break;
        }

        return 0;
    },
};

export default model;
