/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { MissingEnvironmentVariableException } from "../Exception/MissingEnvironmentVariableException";
import { EnvironmentInterface } from "./EnvironmentInterface";

/**
 * This class handle operations on the node process environment.
 */
export class ProcessEnvironment implements EnvironmentInterface {

    /**
     * Checks if a environment variable with the given name exist.
     *
     * @example
     * ```typescript
     * const environment = new ProcessEnvironment();
     * if(environment.has("FOO")){
     *     // do your stuff.
     * }
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {boolean} True if the variable exist, false otherwise
     */
    public has(key: string): boolean {
        return typeof process.env[key.toUpperCase()] !== "undefined";
    }

    /**
     * Returns the value of a environment variable.
     *
     * @example
     * ```typescript
     * const environment = new ProcessEnvironment();
     * const value = environment.get("BAR");
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {string} The value of the environment variable
     * @throws {MissingEnvironmentVariableException} Will be thrown if the variable does not exist.
     */
    public get(key: string): string {
        if (!this.has(key)) {
            throw new MissingEnvironmentVariableException(key);
        }

        return process.env[key.toUpperCase()] as string;
    }

    /**
     * Set a environment variable to a given value.
     *
     * @example
     * ```typescript
     * const environment = new ProcessEnvironment();
     * const value = environment.set("FOO", "Bar");
     * ```
     *
     * @param {string} key The environment variable name
     * @param {string} value The value to set the environment variable to
     * @returns {this}
     */
    public set(key: string, value: string): this {
        process.env[key.toUpperCase()] = value;

        return this;
    }

    /**
     * Unset a environment variable
     *
     * @example
     * ```typescript
     * const environment = new ProcessEnvironment();
     * const value = environment.unset("FOO");
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {this}
     */
    public unset(key: string): this {
        delete process.env[key.toUpperCase()];

        return this;
    }

}
