/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { existsSync, promises as fs } from "fs";
import * as path from "path";

import { EnvironmentInterface } from "../Environment/EnvironmentInterface";
import { ProcessEnvironment } from "../Environment/ProcessEnvironment";
import { NormalizedValues } from "../NormalizedValues";
import { EnvironmentLoaderInterface } from "./EnvironmentLoaderInterface";
import { DotEnvFileLoader } from "./FileLoader/DotEnvFileLoader";
import { EnvironmentFileLoaderInterface } from "./FileLoader/EnvironmentFileLoaderInterface";
import { JsonFileLoader } from "./FileLoader/JsonFileLoader";

export class EnvironmentLoader implements EnvironmentLoaderInterface {

    protected environment: EnvironmentInterface;

    protected environmentFileLoaders: EnvironmentFileLoaderInterface[] = [];

    public constructor(environment: EnvironmentInterface | null = null) {
        if (null === environment) {
            this.environment = new ProcessEnvironment();
        } else {
            this.environment = environment;
        }
    }

    /**
     * Loads environment files and populate the variables in the process environment.
     * This is more secure and also includes mutations from the given input file.
     *
     * @example
     * ```typescript
     * const environmentLoader = new EnvironmentLoader();
     * environmentLoader.loadEnv('.env.<extension>');
     * ```
     *
     * 1. If `.env.<extension>` exists, it is loaded first. In case there's no `.env.<extension>` file but a `.env.dist.<extension>`, this one will be loaded instead.
     * 2. If one of the previously mentioned files contains the `APP_ENV` variable, the variable is populated and used to load environment-specific files hereafter. If `APP_ENV` is not defined in either of the previously mentioned files, dev is assumed for `APP_ENV` and populated by default.
     * 3. If there's a `.env.local.<extension>` representing general local environment variables it's loaded now.
     * 4. If there's a `.env.${env}.local.<extension>` file, this one is loaded. Otherwise, it falls back to `.env.${env}.<extension>`.
     *
     * @param {string} file
     * @param {string} environmentVariableName
     * @param {string} defaultEnvironment
     */
    public async loadEnvironment(file: string, environmentVariableName: string = "APP_ENV", defaultEnvironment: string = "dev"): Promise<void> {
        const extension = path.extname(file);
        const basename = path.basename(file, extension);
        const directory = path.dirname(file);
        const baseFilePath = path.join(directory, basename).replace(/[/\\]/g, "/");

        const distEnvironmentFile = baseFilePath + ".dist" + extension;
        const localEnvironmentFile = baseFilePath + ".local" + extension;

        if (existsSync(file)) {
            await this.load(file);
        } else if (existsSync(distEnvironmentFile)) {
            await this.load(distEnvironmentFile);
        }

        let currentEnvironment: string | null = this.environment.has(environmentVariableName)
            ? this.environment.get(environmentVariableName)
            : null;

        if (null === currentEnvironment) {
            const values: NormalizedValues = {};

            currentEnvironment = values[environmentVariableName] = defaultEnvironment;
            this.populate(values);
        }

        if (existsSync(localEnvironmentFile)) {
            await this.load(localEnvironmentFile);
            if (this.environment.has(environmentVariableName)) {
                currentEnvironment = this.environment.get(environmentVariableName);
            }
        }

        if ("local" === currentEnvironment) {
            return;
        }

        const environmentFile = baseFilePath + "." + currentEnvironment + extension;
        const environmentLocalFile = baseFilePath + "." + currentEnvironment + ".local" + extension;

        if (existsSync(environmentFile)) {
            await this.load(environmentFile);
        }

        if (existsSync(environmentLocalFile)) {
            await this.load(environmentLocalFile);
        }
    }

    /**
     * Populates the variables in the process environment.
     *
     * @example
     * ```typescript
     * const environmentLoader = new EnvironmentLoader();
     * const vars = environmentLoader.populate({ FOO: "BAR", BAR_FOO: "BAZ" });
     * ```
     *
     * @param {NormalizedValues} values
     * @param {boolean} override
     */
    public populate(values: NormalizedValues, override: boolean = false): this {
        const loadedVars = this.getLoadedVars();
        let updateLoadedVars = false;

        for (const [key, value] of Object.entries(values)) {
            if ((loadedVars.indexOf(key) === -1) && (!override && this.environment.has(key))) {
                continue;
            }

            this.environment.set(key, value);

            if (loadedVars.indexOf(key) === -1) {
                updateLoadedVars = true;
                loadedVars.push(key);
            }
        }

        if (updateLoadedVars) {
            this.setLoadedVars(loadedVars);
        }

        return this;
    }

    /**
     * Loads environment files and [[populate|populates]] the variables in the process environment.
     *
     * @example
     * ```typescript
     * const environmentLoader = new EnvironmentLoader();
     * environmentLoader.load('.env.json');
     * ```
     *
     * @param {string} file
     * @param {string} files
     */
    public async load(file: string, ...files: string[]): Promise<void> {
        await this.doLoad(false, [file, ...files]);
    }

    /**
     * Loads environment files and [[populate|populates]] the variables in the process environment.
     * If a variable already exists, it will be overridden.
     *
     * @example
     * ```typescript
     * const environmentLoader = new EnvironmentLoader();
     * environmentLoader.overload('.env.json');
     * ```
     *
     * @param {string} file
     * @param {string} files
     */
    public async overload(file: string, ...files: string[]): Promise<void> {
        await this.doLoad(true, [file, ...files]);
    }

    protected getEnvironmentFileLoaders(): EnvironmentFileLoaderInterface[] {
        if (!this.environmentFileLoaders.length) {
            this.environmentFileLoaders = this.getDefaultEnvironmentFileLoaders();
        }

        return this.environmentFileLoaders;
    }

    protected getDefaultEnvironmentFileLoaders(): EnvironmentFileLoaderInterface[] {
        return [
            new JsonFileLoader(),
            new DotEnvFileLoader(),
        ];
    }

    /**
     * Loads the actual file, [[parse|parses]] and [[normalize|normalizes]] the content and [[populate|populates]] the variables.
     *
     * @param {boolean} override
     * @param {string[]} files
     */
    private async doLoad(override: boolean, files: string[]): Promise<void> {
        const environmentFileLoaders = this.getEnvironmentFileLoaders();

        for (const file of files) {
            const stat = await fs.stat(file);

            if (!stat.isFile()) {
                throw new Error(`Unable to read the "${file}" environment file.`);
            }

            for (const environmentFileLoader of environmentFileLoaders) {
                if (environmentFileLoader.supports(file)) {
                    const values = await environmentFileLoader.load(file);

                    this.populate(values, override);
                }
            }
        }
    }

    /**
     * @hidden
     * @returns {string[]}
     */
    private getLoadedVars(): string[] {
        if (this.environment.has("ENVIRONMENT_VARS")) {
            return this.environment.get("ENVIRONMENT_VARS").split(",");
        }

        return [];
    }

    /**
     * @hidden
     * @param {string[]} loadedVars
     */
    private setLoadedVars(loadedVars: string[]): void {
        this.environment.set("ENVIRONMENT_VARS", loadedVars.join(","));
    }

}
