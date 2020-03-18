/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { NormalizedValues } from "../NormalizedValues";

export interface EnvironmentLoaderInterface {

    /**
     * Loads environment files and populate the variables in the environment.
     * This is more secure and also includes mutations from the given input file.
     *
     * @param {string} file
     * @param {string} environmentVariableName
     * @param {string} defaultEnvironment
     */
    loadEnvironment(file: string, environmentVariableName?: string, defaultEnvironment?: string): Promise<void>;

    /**
     * Loads environment files and [[populate|populates]] the variables in the environment.
     *
     * @param {string} file
     * @param {string} files
     */
    load(file: string, ...files: string[]): Promise<void>;

    /**
     * Loads environment files and [[populate|populates]] the variables in the environment.
     * If a variable already exists, it will be overridden.
     *
     * @param {string} file
     * @param {string} files
     */
    overload(file: string, ...files: string[]): Promise<void>;

    /**
     * Populates the variables in the environment.
     *
     * @param {NormalizedValues} values
     * @param {boolean} override
     */
    populate(values: NormalizedValues, override?: boolean): this;

}
