/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { RuntimeException } from "../Exception/RuntimeException";
import { JsonEnvironmentFileValues } from "../Loader/FileLoader/JsonEnvironmentFileValues";
import { NormalizedValues } from "../NormalizedValues";
import { ParserInterface } from "./ParserInterface";

export class JsonParser implements ParserInterface {

    public parse(filePath: string, data: string): NormalizedValues {
        try {
            const values: JsonEnvironmentFileValues = JSON.parse(data);

            return this.normalize(values);
        } catch (exception) {
            throw new RuntimeException(`Unable to parse JSON data from file "${filePath}". ${exception.message}`);
        }
    }

    /**
     * Normalizes a tree by flattening it to a key value object.
     * Each value will also be casted to string, cause only strings are supported in NodeJS Process environments.
     *
     * @param {JsonEnvironmentFileValues} values
     * @returns {NormalizedValues}
     */
    private normalize(values: JsonEnvironmentFileValues): NormalizedValues {
        let normalized: NormalizedValues = {};

        for (const [key, value] of Object.entries(values)) {
            if (!Array.isArray(value) && typeof value === "object") {
                const items: JsonEnvironmentFileValues = {};

                for (const [subKey, subValue] of Object.entries(value)) {
                    items[key + "_" + subKey] = subValue;
                }

                normalized = Object.assign(normalized, this.normalize(items));
            } else {
                normalized[key] = value.toString();
            }
        }

        return normalized;
    }

}
