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

import { PairedSkillData, SkillData } from "../types";

// Repeatedly string.replace(...) until the value no longer changes after an iteration
function replaceAll(inputValue: string, searchValue: string | RegExp, replaceValue: string): string {
    var result = inputValue.replace(searchValue, replaceValue);
    while (result != inputValue) {
        inputValue = result;
        result = inputValue.replace(searchValue, replaceValue);
    }
    return result;
};

type LuaSkillModel = {
    skill: number;
    comSkill: number;
    skillOffset: number;
    comSkillOffset: number;
    adagrad: number;

    tdSkill: number;
    tdComSkill: number;
    tdSkillOffset: number;
    tdComSkillOffset: number;
    tdAdagrad: number;
};

/**
 * Deserialize a logged game engine string representing a skill model into a strongly typed skill model.
 * @param luaStr A lua-formatted string representing a LuaSkillModel.
 * @param parseErrCb A callback that will be invoked if a parsing error occurs.
 * @returns A PairedSkillModel representing the string.
 */
export function deserializeSkillModel(luaStr: string, parseErrCb: (jstr: string, err: any) => void) : PairedSkillData | null {
    if (!luaStr || luaStr.length < 20) {
        parseErrCb("(null)", "Null or insufficient luaStr passed to deserializeSkillModel");
        return null;
    }

    // See `ns2/lua/NetworkMessages_Client.lua` for what *all* of these numbers mean; we really only care about 1-4, 6-9

    // Sample expected string, with values for 15 and 16 fudged (latitude & longitude):
    // {1 = "2,966",2 = "439",3 = "-,309",4 = "-,457",5 = "6.283908367157",6 = "1,976",7 = "795",8 = "-,119",9 = "11",10 = "4.3614330291748",11 = "600",12 = "9,797,646",13 = "0",14 = "",15 = "69",16 = "420",17 = "true"}

    var jsonStr = luaStr.trim()
        // trim off keys 11 and later, these are meaningless to us (as is 10, but leave it for parsing into an inGameSkillStruct)
        .substring(0, luaStr.indexOf(',11 = '))
        // correct the json obj terminator
        .concat('}')
        // convert numbered keys to json string keys
        .replace('1 = ', ' "skill": ')
        .replace('2 = ', ' "comSkill": ')
        .replace('3 = ', ' "skillOffset": ')
        .replace('4 = ', ' "comSkillOffset": ')
        .replace('5 = ', ' "adagrad": ')
        .replace('6 = ', ' "tdSkill": ')
        .replace('7 = ', ' "tdComSkill": ')
        .replace('8 = ', ' "tdSkillOffset": ')
        .replace('9 = ', ' "tdComSkillOffset": ')
        .replace('10 = ', ' "tdAdagrad": ')
        // trim the trailing tdAdagrad value quote
        .replace('"}', '}');

    // convert negative values with rando commas, see values 3,8 from example (wtf lua)
    jsonStr = replaceAll(jsonStr, ' "-,', ' "-');
    // string values -> number values
    jsonStr = replaceAll(jsonStr, ': "', ': ');
    jsonStr = replaceAll(jsonStr, '", "', ', "');
    // and lastly trim any digit group separator commas from all values, see values 1,6,12 from example (DAMN YOU LUA)
    jsonStr = replaceAll(jsonStr, ',0', '0');
    jsonStr = replaceAll(jsonStr, ',1', '1');
    jsonStr = replaceAll(jsonStr, ',2', '2');
    jsonStr = replaceAll(jsonStr, ',3', '3');
    jsonStr = replaceAll(jsonStr, ',4', '4');
    jsonStr = replaceAll(jsonStr, ',5', '5');
    jsonStr = replaceAll(jsonStr, ',6', '6');
    jsonStr = replaceAll(jsonStr, ',7', '7');
    jsonStr = replaceAll(jsonStr, ',8', '8');
    jsonStr = replaceAll(jsonStr, ',9', '9');

    // then we parse
    let luaModel: LuaSkillModel;
    try {
        luaModel = JSON.parse(jsonStr);
    }
    catch (err) {
        parseErrCb(jsonStr, err);
        return null;
    }

    return {
        pub: {
            skill:          luaModel.skill,
            comSkill:       luaModel.comSkill,
            alienSkill:     luaModel.skill      - luaModel.skillOffset,
            alienComSkill:  luaModel.comSkill   - luaModel.comSkillOffset,
            marineSkill:    luaModel.skill      + luaModel.skillOffset,
            marineComSkill: luaModel.comSkill   + luaModel.comSkillOffset,
        },
        td: {
            skill:          luaModel.tdSkill,
            comSkill:       luaModel.tdComSkill,
            alienSkill:     luaModel.tdSkill      - luaModel.tdSkillOffset,
            alienComSkill:  luaModel.tdComSkill   - luaModel.tdComSkillOffset,
            marineSkill:    luaModel.tdSkill      + luaModel.tdSkillOffset,
            marineComSkill: luaModel.tdComSkill   + luaModel.tdComSkillOffset,
        }
    };
};

export function summarizeSkillData(data: SkillData, bUseSigns: boolean = false): string | null {
    if (!data) {
        return null;
    }
    const result: Array<string> = [];
    if (data.skill) {
        const sign = bUseSigns && data.skill > 0 ? '+' : '';
        result.push(`Skill: ${sign}${data.skill}`);
    }
    if (data.comSkill) {
        const sign = bUseSigns && data.comSkill > 0 ? '+' : '';
        result.push(`ComSkill: ${sign}${data.comSkill}`);
    }

    if (result.length == 0) {
        if (data.marineSkill) {
            const sign = bUseSigns && data.marineSkill > 0 ? '+' : '';
            result.push(`Marine: ${sign}${data.marineSkill}`);
        }
        if (data.alienSkill) {
            const sign = bUseSigns && data.alienSkill > 0 ? '+' : '';
            result.push(`Alien: ${sign}${data.alienSkill}`);
        }
        if (data.marineComSkill) {
            const sign = bUseSigns && data.marineComSkill > 0 ? '+' : '';
            result.push(`MarineCom: ${sign}${data.marineComSkill}`);
        }
        if (data.alienComSkill) {
            const sign = bUseSigns && data.alienComSkill > 0 ? '+' : '';
            result.push(`AlienCom: ${sign}${data.alienComSkill}`);
        }
    }

    if (result.length >= 1) {
        return result.join(", ").trim();
    }
    return '{}';
};

export function summarizeSkillDataPair(data: PairedSkillData, bUseSigns: boolean = false): string | null {
    if (!data || (!data.pub && !data.td)) {
        return null;
    }
    const { pub, td } = data;
    const result: Array<string> = [];

    if (pub) {
        if (pub.skill) {
            const sign = bUseSigns && pub.skill > 0 ? '+' : '';
            result.push(`Skill: ${sign}${pub.skill}`);
        }
        if (pub.comSkill) {
            const sign = bUseSigns && pub.comSkill > 0 ? '+' : '';
            result.push(`ComSkill: ${sign}${pub.comSkill}`);
        }
        if (result.length == 0) {
            // fallback to teamA, teamB, teamACom, teamBCom if available
            if (pub.marineSkill) {
                const sign = bUseSigns && pub.marineSkill > 0 ? '+' : '';
                result.push(`Marine: ${sign}${pub.marineSkill}`);
            }
            if (pub.alienSkill) {
                const sign = bUseSigns && pub.alienSkill > 0 ? '+' : '';
                result.push(`Alien: ${sign}${pub.alienSkill}`);
            }
            if (pub.marineComSkill) {
                const sign = bUseSigns && pub.marineComSkill > 0 ? '+' : '';
                result.push(`MarineCom: ${sign}${pub.marineComSkill}`);
            }
            if (pub.alienComSkill) {
                const sign = bUseSigns && pub.alienComSkill > 0 ? '+' : '';
                result.push(`AlienCom: ${sign}${pub.alienComSkill}`);
            }
        }
    }

    const len = result.length;
    if (td) {
        if (td.skill) {
            const sign = bUseSigns && td.skill > 0 ? '+' : '';
            result.push(`TDSkill: ${sign}${td.skill}`);
        }
        if (td.comSkill) {
            const sign = bUseSigns && td.comSkill > 0 ? '+' : '';
            result.push(`TDComSkill: ${sign}${td.comSkill}`);
        }
        if (result.length == len) {
            if (td.marineSkill) {
                const sign = bUseSigns && td.marineSkill > 0 ? '+' : '';
                result.push(`TDMarine: ${sign}${td.marineSkill}`);
            }
            if (td.alienSkill) {
                const sign = bUseSigns && td.alienSkill > 0 ? '+' : '';
                result.push(`TDAlien: ${sign}${td.alienSkill}`);
            }
            if (td.marineComSkill) {
                const sign = bUseSigns && td.marineComSkill > 0 ? '+' : '';
                result.push(`TDMarineCom: ${sign}${td.marineComSkill}`);
            }
            if (td.alienComSkill) {
                const sign = bUseSigns && td.alienComSkill > 0 ? '+' : '';
                result.push(`TDAlienCom: ${sign}${td.alienComSkill}`);
            }
        }
    }

    if (result.length >= 1) {
        return result.join(", ");
    }
    return "{}";
};
