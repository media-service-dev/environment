/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { JsonFileLoader } from "../../src/Loader/FileLoader/JsonFileLoader";

describe("JsonFileLoader", () => {

    describe("parse", () => {

        it("should ", () => {
            // Arrange
            const loader = new JsonFileLoader();

            // Act
            const actual = loader.load(".tes");

            // Assert
            expect(actual).toBe("");
        });

    });

});
