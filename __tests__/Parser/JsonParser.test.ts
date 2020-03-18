/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import each from "jest-each";
import { JsonParser } from "../../src/Parser/JsonParser";

describe("JsonParser", () => {

    it("should fail on invalid data", () => {
        expect.assertions(1);
        const jsonParser = new JsonParser();

        try {
            jsonParser.parse("file.json", "{\"TEST_FOO:\"bar\"}");
        } catch (exception) {
            expect(exception).toHaveProperty("message", "Unable to parse JSON data from file \"file.json\". Unexpected token b in JSON at position 12");
        }
    });

    function getShouldParseTestData() {
        return [
            ["{\"TEST_FOO\":\"bar\"}", { TEST_FOO: "bar" }], // data set 0
            ["{\"TEST_FOO\":true}", { TEST_FOO: "true" }], // data set 1
            ["{\"TEST_FOO\":10}", { TEST_FOO: "10" }], // data set 2
            ["{\"TEST_FOO\":{}}", {}], // data set 3
            ["{\"TEST_FOO\":[\"bar\"]}", { TEST_FOO: "bar" }], // data set 4
            ["{\"TEST_FOO\":[\"foo\", \"bar\"]}", { TEST_FOO: "foo,bar" }], // data set 5
            [ // data set 6
                "{\"TEST_APP_KEYS\":\"barfoo\",\"TEST_APP\":{\"ENV\":\"DEV\",\"VERSION\":\"0.1.0-DEV\",\"KEYS\":{\"SERVER\":\"foobar\"}},\"TEST_APP_VERSION\":\"0.2.0-BETA\"}",
                {
                    "TEST_APP_KEYS": "barfoo",
                    "TEST_APP_ENV": "DEV",
                    "TEST_APP_VERSION": "0.2.0-BETA",
                    "TEST_APP_KEYS_SERVER": "foobar",
                },
            ],
        ];
    }

    each(getShouldParseTestData()).it("should parse with data set #%#", (input, expected) => {
        const jsonParser = new JsonParser();

        expect(jsonParser.parse("file.json", input)).toEqual(expected);
    });

});
