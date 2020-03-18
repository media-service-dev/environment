/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { NormalizedValues } from "../../NormalizedValues";

export interface EnvironmentFileLoaderInterface {

    /**
     * Parses the loaded data returns the content in a environment normalized form
     *
     * @param {string} data
     * @returns {NormalizedValues} The data in normalized environment form
     */
    parse(data: string): NormalizedValues;

    /**
     * Loads the given file and returns the content in a environment normalized form
     *
     * @param {string} filePath The path to the file
     * @returns {NormalizedValues} The data in normalized environment form
     */
    load(filePath: string): Promise<NormalizedValues>;

    /**
     * Checks whether the file is supported to load or not
     *
     * @param {string} filePath The path to the file
     */
    supports(filePath: string): boolean;

}
