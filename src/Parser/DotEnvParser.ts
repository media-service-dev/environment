/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { FormatException } from "../Exception/FormatException";
import { FormatExceptionContext } from "../Exception/FormatExceptionContext";
import { NormalizedValues } from "../NormalizedValues";
import { ParserInterface } from "./ParserInterface";

export class DotEnvParser implements ParserInterface {

    protected static VARIABLE_NAME_EXPRESSION = "(?:[A-Z][A-Z0-9_]+)";

    protected filePath: string = "";

    protected data: string = "";

    protected line: number = 1;

    protected cursor: number = 0;

    protected end: number = 0;

    protected values: NormalizedValues = {};

    /**
     * @inheritdoc
     */
    public parse(filePath: string, data: string): NormalizedValues {
        this.filePath = filePath;
        this.data = data.replace(/(\r\n|\n|\r)/g, "\n");
        this.line = 1;
        this.cursor = 0;
        this.end = this.data.length;
        this.values = {};

        let state: "VARIABLE_NAME" | "VALUE" = "VARIABLE_NAME";
        let name: string = "";

        this.skipEmptyLines();

        while (this.cursor < this.end) {
            switch (state) {
                case "VARIABLE_NAME":
                    name = this.lexVariableName();
                    state = "VALUE";
                    break;

                case "VALUE":
                    this.values[name] = this.lexValue();
                    state = "VARIABLE_NAME";
                    break;
            }
        }

        if ("VALUE" === state) {
            this.values[name] = "";
        }

        try {
            return { ...this.values };
        } finally {
            this.values = {};
            this.data = "";
            this.filePath = "";
        }
    }

    /**
     * Skips empty lines
     */
    private skipEmptyLines() {
        const emptyLineExpression = /^(?:\s*(?:#[^\n]*)?)+/m;
        const data = this.data.slice(this.cursor);
        const match = data.match(emptyLineExpression);

        if (match) {
            const [text] = match.slice(0);

            this.moveCursor(text);
        }
    }

    /**
     * Moves the cursor forward in length of the text
     * @param {string} text
     */
    private moveCursor(text: string) {
        const matches = Array.from(text.matchAll(/\n/g));

        this.cursor += text.length;
        this.line += matches.length;
    }

    /**
     * Lexing the variable name
     */
    private lexVariableName() {
        // var name + optional export
        const variableNameExpression = new RegExp("(export[ \t]*)?(" + DotEnvParser.VARIABLE_NAME_EXPRESSION + ")", "i");
        const data = this.data.slice(this.cursor);

        const match = data.match(variableNameExpression);

        if (!match) {
            throw this.createFormatException("Invalid character in variable name");
        }

        const [fullMatch, exportGroup, variableName] = match.slice(0);

        this.moveCursor(fullMatch);

        if (this.cursor === this.end || "\n" === this.data[this.cursor] || "#" === this.data[this.cursor]) {
            if (exportGroup) {
                throw this.createFormatException("Unable to unset an environment variable");
            }

            throw this.createFormatException("Missing = in the environment variable declaration");
        }

        if (" " === this.data[this.cursor] || "\t" === this.data[this.cursor]) {
            throw this.createFormatException("Whitespace characters are not supported after the variable name");
        }

        if ("=" !== this.data[this.cursor]) {
            throw this.createFormatException("Missing = in the environment variable declaration");
        }

        ++this.cursor;

        return variableName;
    }

    /**
     * Lexing the value
     */
    private lexValue() {
        const emptyExpression = /^[ \t]*(?:#.*)?$/;
        const data = this.data.slice(this.cursor);
        const match = data.match(emptyExpression);

        if (match) {
            const [first] = match.slice(0);

            if (first.length > 0) {
                this.moveCursor(first);
                this.skipEmptyLines();

                return "";
            }
        }

        if (" " === this.data[this.cursor] || "\t" === this.data[this.cursor]) {
            throw this.createFormatException("Whitespace are not supported before the value");
        }

        let value = "";

        do {
            if ("'" === this.data[this.cursor]) {
                value += this.lexSingleQuotedValue();
            } else if ("\"" === this.data[this.cursor]) {
                value += this.lexDoubleQuotedValue();
            } else {
                value += this.lexUnquotedValue();

                if (this.cursor < this.end && "#" === this.data[this.cursor]) {
                    break;
                }
            }
        } while (this.cursor < this.end && "\n" !== this.data[this.cursor]);

        this.skipEmptyLines();

        return value;
    }

    /**
     * Lex the value if it was lexed to be in double quotes
     */
    private lexDoubleQuotedValue() {
        let value = "";

        if (++this.cursor === this.end) {
            throw this.createFormatException("Missing quote to end the value");
        }

        while ("\"" !== this.data[this.cursor] || ("\\" === this.data[this.cursor - 1] && "\\" !== this.data[this.cursor - "\\\\".length])) {
            value += this.data[this.cursor];
            ++this.cursor;

            if (this.cursor === this.end) {
                throw this.createFormatException("Missing quote to end the value");
            }
        }

        ++this.cursor;

        value = value
            .replace(/\\"/g, "\"")
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r");

        return value.replace("\\\\", "\\");
    }

    /**
     * Creates a FormatException with current context
     *
     * @param {string} message
     * @returns {FormatException} The format exception with the actual context
     */
    private createFormatException(message: string): FormatException {
        return new FormatException(message, new FormatExceptionContext(this.data, this.filePath, this.line, this.cursor));
    }

    /**
     * Lex the value in single quotes if it was lexed to be in single quotes
     */
    private lexSingleQuotedValue() {
        let length = 0;

        do {
            if (this.cursor + ++length === this.end) {
                this.cursor += length;
                throw this.createFormatException("Missing quote to end the value");
            }
        } while ("'" !== this.data[this.cursor + length]);

        let value = this.data.substr(1 + this.cursor, length - 1);

        value = value
            .replace(/\\"/g, "\"")
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r");

        this.cursor += 1 + length;

        return value;
    }

    /**
     * Lex the value if there wasn't any other lexing like double or single quotes
     */
    private lexUnquotedValue() {
        let value = "";
        let previousCharacter = this.data[this.cursor - 1];

        while (this.cursor < this.end && ["\n", "\"", "'"].indexOf(this.data[this.cursor]) === -1 && !((" " === previousCharacter || "\t" === previousCharacter) && "#" === this.data[this.cursor])) {
            if ("\\" === this.data[this.cursor] && typeof this.data[this.cursor + 1] !== "undefined" && ("\"" === this.data[this.cursor + 1] || "'" === this.data[this.cursor + 1])) {
                ++this.cursor;
            }

            value += previousCharacter = this.data[this.cursor];

            ++this.cursor;
        }
        value = value.trimRight();
        const resolvedValue = value.replace(/\\\\/g, "\\");

        if (resolvedValue === value && value.match(/\s+/g)) {
            throw this.createFormatException("A value containing spaces must be surrounded by quotes");
        }

        return resolvedValue;
    }

}
