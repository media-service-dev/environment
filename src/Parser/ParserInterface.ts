/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { NormalizedValues } from "../NormalizedValues";

export interface ParserInterface {

    /**
     *
     * @param {string} filePath The path to the file
     * @param {string} data The raw contents of the file
     * @returns {NormalizedValues} The data in environment normalized form
     */
    parse(filePath: string, data: string): NormalizedValues;

}
