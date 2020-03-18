/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

export class FormatExceptionContext {

    private readonly data: string;

    private readonly filePath: string;

    private readonly line: number;

    private readonly cursor: number;

    // eslint-disable-next-line max-params
    public constructor(data: string, filePath: string, line: number, cursor: number) {
        this.data = data;
        this.filePath = filePath;
        this.line = line;
        this.cursor = cursor;
    }

    public getPath(): string {
        return this.filePath;
    }

    public getLine(): number {
        return this.line;
    }

    public getDetails() {
        const paddingChars = 20;
        const paddingForSpaceAndIndex = 2;
        const before = this.data.substr(Math.max(0, this.cursor - paddingChars), Math.min(paddingChars, this.cursor)).replace("\n", "\\n");
        const after = this.data.substr(this.cursor, paddingChars).replace("\n", "\\n");

        return "..." + before + after + "...\n" + " ".repeat(before.length + paddingForSpaceAndIndex) + "^ line " + this.line + " offset " + this.cursor;
    }

}
