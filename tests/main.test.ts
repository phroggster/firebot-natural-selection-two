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

// TODO: a different jest transpiler? SyntaxError: Unexpected token 'export'
//import { isValidSemVer, parseSemVer } from 'semver-parser';
import ns2Script from '../src/main';
import packageJson from '../package.json';

test('script exports are appropriate', () => {
    expect(ns2Script).not.toBeUndefined();

    expect(ns2Script.getScriptManifest).not.toBeUndefined();
    expect(ns2Script.getDefaultParameters).not.toBeUndefined();
    expect(ns2Script.parametersUpdated).not.toBeUndefined();
    expect(ns2Script.run).not.toBeUndefined();
    expect(ns2Script.stop).not.toBeUndefined();
});

test('script manifest version is legit', async () => {
    const scriptManifest = await ns2Script.getScriptManifest();

    expect(scriptManifest.version).not.toBeNull();
    expect(scriptManifest.version).not.toBeUndefined();

    expect(scriptManifest.version).toBeInstanceOf(typeof String);
    expect(scriptManifest.version).toStrictEqual(packageJson.version);
    //expect(isValidSemVer(scriptManifest.version, true)).toEqual(true);
    //expect(parseSemVer(scriptManifest.version, true)).not.toBeUndefined();
});
