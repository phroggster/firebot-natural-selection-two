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

import { logger } from "../src/logger";

test('initial logger is not undefined', () => {
    expect(logger).not.toBeUndefined();
    expect(logger.debug).not.toBeUndefined();
    expect(logger.info).not.toBeUndefined();
    expect(logger.warn).not.toBeUndefined();
    expect(logger.error).not.toBeUndefined();
});

test('starting logger does not throw before init', () => {
    expect(() => { logger.debug("Test"); }).not.toThrow();
    expect(() => { logger.info("Test"); }).not.toThrow();
    expect(() => { logger.warn("Test"); }).not.toThrow();
    expect(() => { logger.error("Test"); }).not.toThrow();
});
