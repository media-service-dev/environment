/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { MissingEnvironmentVariableException } from "../Exception/MissingEnvironmentVariableException";
import { NormalizedValues } from "../NormalizedValues";
import { EnvironmentInterface } from "./EnvironmentInterface";

/**
 * This class handles environment operations on a object
 */
export class ObjectEnvironment implements EnvironmentInterface {

    protected variables: NormalizedValues = {};

    public constructor(variables: NormalizedValues = {}) {
        this.setVariables(variables);
    }

    /**
     * Checks if a environment variable with the given name exist.
     *
     * @example
     * ```typescript
     * const environment = new ObjectEnvironment();
     * if(environment.has("FOO")){
     *     // do your stuff...
     * }
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {boolean} True if the variable exist, false otherwise
     */
    public has(key: string): boolean {
        key = key.toUpperCase();

        return typeof this.variables[key] !== "undefined";
    }

    /**
     * Returns the value of a environment variable.
     *
     * @example
     * ```typescript
     * const environment = new ObjectEnvironment();
     * const value = environment.get("BAR");
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {string} The value of the environment variable
     * @throws {MissingEnvironmentVariableException} Will be thrown if the variable does not exist.
     */
    public get(key: string): string {
        key = key.toUpperCase();
        if (!this.has(key)) {
            throw new MissingEnvironmentVariableException(key);
        }

        return this.variables[key];
    }

    /**
     * Set a environment variable to a given value.
     *
     * @example
     * ```typescript
     * const environment = new ObjectEnvironment();
     * const value = environment.set("FOO", "Bar");
     * ```
     *
     * @param {string} key The environment variable name
     * @param {string} value The value to set the environment variable to
     * @returns {this}
     */
    public set(key: string, value: string): this {
        key = key.toUpperCase();
        this.variables[key] = value;

        return this;
    }

    /**
     * Unset a environment variable
     *
     * @example
     * ```typescript
     * const environment = new ObjectEnvironment();
     * const value = environment.unset("FOO");
     * ```
     *
     * @param {string} key The environment variable name
     * @returns {this}
     */
    public unset(key: string): this {
        key = key.toUpperCase();
        delete this.variables[key];

        return this;
    }

    private setVariables(variables: NormalizedValues) {
        const keys = Object.keys(variables);

        for (const key of keys) {
            const value = variables[key];

            this.set(key, value);
        }
    }

}
