/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { promises as fs } from "fs";
import * as path from "path";
import { NormalizedValues } from "../../NormalizedValues";
import { JsonParser } from "../../Parser/JsonParser";
import { EnvironmentFileLoaderInterface } from "./EnvironmentFileLoaderInterface";

export class JsonFileLoader implements EnvironmentFileLoaderInterface {

    protected parser: JsonParser;

    protected filePath: string = "";

    public constructor(parser: JsonParser | null = null) {
        if (null !== parser) {
            this.parser = parser;
        } else {
            this.parser = new JsonParser();
        }
    }

    /**
     * @inheritdoc
     */
    public parse(data: string): NormalizedValues {
        return this.parser.parse(this.filePath, data);
    }

    /**
     * @inheritdoc
     */
    public async load(fileName: string): Promise<NormalizedValues> {
        this.filePath = fileName;
        const buffer = await fs.readFile(fileName);
        const content = buffer.toString();

        return this.parse(content);
    }

    /**
     * @inheritdoc
     */
    public supports(fileName: string): boolean {
        return ".json" === path.extname(fileName);
    }

}
