/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import each from "jest-each";
import { NormalizedValues } from "../../src/NormalizedValues";
import { DotEnvParser } from "../../src/Parser/DotEnvParser";

describe("DotEnvParser", () => {

    each([
        ["FOO=BAR BAZ", "A value containing spaces must be surrounded by quotes in \".env\" at line 1.\n...FOO=BAR BAZ...\n             ^ line 1 offset 11"],
        ["FOO BAR=BAR", "Whitespace characters are not supported after the variable name in \".env\" at line 1.\n...FOO BAR=BAR...\n     ^ line 1 offset 3"],
        ["FOO", "Missing = in the environment variable declaration in \".env\" at line 1.\n...FOO...\n     ^ line 1 offset 3"],
        ["FOO=\"foo", "Missing quote to end the value in \".env\" at line 1.\n...FOO=\"foo...\n          ^ line 1 offset 8"],
        ["FOO='foo", "Missing quote to end the value in \".env\" at line 1.\n...FOO='foo...\n          ^ line 1 offset 8"],
        ["FOO=\"foo\nBAR=\"bar\"", "Missing quote to end the value in \".env\" at line 1.\n...FOO=\"foo\\nBAR=\"bar\"...\n                     ^ line 1 offset 18"],
        ["FOO='foo" + "\n", "Missing quote to end the value in \".env\" at line 1.\n...FOO='foo\\n...\n            ^ line 1 offset 9"],
        ["export FOO", "Unable to unset an environment variable in \".env\" at line 1.\n...export FOO...\n            ^ line 1 offset 10"],
        ["FOO= BAR", "Whitespace are not supported before the value in \".env\" at line 1.\n...FOO= BAR...\n      ^ line 1 offset 4"],
        ["Стасян", "Invalid character in variable name in \".env\" at line 1.\n...Стасян...\n  ^ line 1 offset 0"],
        ["FOO!", "Missing = in the environment variable declaration in \".env\" at line 1.\n...FOO!...\n     ^ line 1 offset 3"],
    ])
        .it("should throw with input %s to %s", (input: string, expectedFailure: string) => {
            // Arrange
            const parser = new DotEnvParser();

            // Act
            const actual = () => {
                parser.parse(".env", input);
            };

            // Assert
            expect(actual).toThrow(expectedFailure);
        });

    each([
        // backslashes
        ["FOO=foo\\\\bar", { "FOO": "foo\\bar" }],
        ["FOO='foo\\\\bar'", { "FOO": "foo\\\\bar" }],
        ["FOO=\"foo\\\\bar\"", { "FOO": "foo\\bar" }],

        // spaces
        ["FOO=bar", { "FOO": "bar" }],
        [" FOO=bar ", { "FOO": "bar" }],
        ["FOO=", { "FOO": "" }],
        ["FOO=\n\n\nBAR=bar", { "FOO": "", "BAR": "bar" }],
        ["FOO=  ", { "FOO": "" }],
        ["FOO=\nBAR=bar", { "FOO": "", "BAR": "bar" }],

        // newlines
        ["\n\nFOO=bar\r\n\n", { "FOO": "bar" }],
        ["FOO=bar\r\nBAR=foo", { "FOO": "bar", "BAR": "foo" }],
        ["FOO=bar\rBAR=foo", { "FOO": "bar", "BAR": "foo" }],
        ["FOO=bar\nBAR=foo", { "FOO": "bar", "BAR": "foo" }],

        // quotes
        ["FOO=\"bar\"\n", { "FOO": "bar" }],
        ["FOO=\"bar'foo\"\n", { "FOO": "bar'foo" }],
        ["FOO='bar'\n", { "FOO": "bar" }],
        ["FOO='bar\"foo'\n", { "FOO": "bar\"foo" }],
        ["FOO=\"bar\\\"foo\"\n", { "FOO": "bar\"foo" }],
        ["FOO=\"bar\nfoo\"", { "FOO": "bar\nfoo" }],
        ["FOO=\"bar" + "\\r" + "foo\"", { "FOO": "bar\rfoo" }],
        ["FOO='bar\nfoo'", { "FOO": "bar\nfoo" }],
        ["FOO='bar" + "\\r" + "foo'", { "FOO": "bar\rfoo" }],
        ["FOO='bar\nfoo'", { "FOO": "bar\nfoo" }],
        ["FOO=\" FOO \"", { "FOO": " FOO " }],
        ["FOO=\"  \"", { "FOO": "  " }],
        ["PATH=\"c:\\\\\"", { "PATH": "c:\\" }],
        ["FOO=\"bar\nfoo\"", { "FOO": "bar\nfoo" }],
        ["FOO=BAR\\\"", { "FOO": "BAR\"" }],
        ["FOO=BAR\\'BAZ", { "FOO": "BAR'BAZ" }],
        ["FOO=\\\"BAR", { "FOO": "\"BAR" }],

        // concatenated values
        ["FOO='bar''foo'\n", { "FOO": "barfoo" }],
        ["FOO='bar '' baz'", { "FOO": "bar  baz" }],
        // ["FOO=bar\nBAR='baz'\"\$FOO\"", { "FOO": "bar", "BAR": "bazbar" }],
        ["FOO='bar '\\'' baz'", { "FOO": "bar ' baz" }],

        // comments
        ["#FOO=bar\nBAR=foo", { "BAR": "foo" }],
        ["#FOO=bar # Comment\nBAR=foo", { "BAR": "foo" }],
        ["FOO='bar foo' # Comment", { "FOO": "bar foo" }],
        ["FOO='bar#foo' # Comment", { "FOO": "bar#foo" }],
        ["# Comment\r\nFOO=bar\n# Comment\nBAR=foo", { "FOO": "bar", "BAR": "foo" }],
        ["FOO=bar # Another comment\nBAR=foo", { "FOO": "bar", "BAR": "foo" }],
        ["FOO=\n\n# comment\nBAR=bar", { "FOO": "", "BAR": "bar" }],
        ["FOO=NOT#COMMENT", { "FOO": "NOT#COMMENT" }],
        ["FOO=  # Comment", { "FOO": "" }],

        // edge cases (no conversions, only strings as values)
        ["FOO=0", { "FOO": "0" }],
        ["FOO=false", { "FOO": "false" }],
        ["FOO=null", { "FOO": "null" }],

        // export
        ["export FOO=bar", { "FOO": "bar" }],
        ["  export   FOO=bar", { "FOO": "bar" }],
    ])
        .it("should parse the input correctly %s", (input: string, output: NormalizedValues) => {
            // Arrange
            const parser = new DotEnvParser();

            // Act
            const actual = parser.parse(".env", input);

            // Assert
            expect(actual).toEqual(output);
        });

});
