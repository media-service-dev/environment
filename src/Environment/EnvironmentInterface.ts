/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

export interface EnvironmentInterface {

    /**
     * Checks if a environment variable with the given name exist.
     *
     * @param {string} key The environment variable name
     * @returns {boolean} True if the variable exist, false otherwise
     */
    has(key: string): boolean;

    /**
     * Returns the value of a environment variable.
     *
     * @param {string} key The environment variable name
     * @returns {string} The value of the environment variable
     * @throws {MissingEnvironmentVariableException} Will be thrown if the variable does not exist.
     */
    get(key: string): string;

    /**
     * Set a environment variable to a given value.
     *
     * @param {string} key The environment variable name
     * @param {string} value The value of the environment variable
     * @returns {this}
     */
    set(key: string, value: string): this;

    /**
     * Unset a environment variable
     *
     * @param {string} key The environment variable name
     * @returns {this}
     */
    unset(key: string): this;

}
