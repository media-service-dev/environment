/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import each from "jest-each";
import { DirectoryItems } from "mock-fs/lib/filesystem";

import { ObjectEnvironment } from "../../src/Environment/ObjectEnvironment";
import { EnvironmentLoader } from "../../src/Loader/EnvironmentLoader";
import mockFs = require("mock-fs");

describe("EnvironmentLoader", () => {

    describe("json", () => {

        it("should load", async () => {
            const environment = new ObjectEnvironment();

            mockFs({
                "a": {
                    ".env.json": "{\"TEST_FOO\": \"bar\"}",
                },
                "b": {
                    ".env.json": "{\"TEST_BAR\": \"baz\"}",
                },
            });

            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.load("a/.env.json");
            await environmentLoader.load("b/.env.json");

            expect(environment.get("TEST_FOO")).toBe("bar");
            expect(environment.get("TEST_BAR")).toBe("baz");

            mockFs.restore();
        });

        function getShouldLoadEnvTestData() {
            return [
                [ // data set 0
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env.json": "{\"TEST_FOO\": \"bar\"}",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "bar", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 1
                    { // The key-value environment
                        TEST_APP_ENV: "local",
                    },
                    { // the fs mock config
                        "a": {
                            ".env.json": "{\"TEST_FOO\": \"bar\"}",
                            ".env.local.json": "{\"TEST_FOO\": \"localBAR\"}",
                        },
                    },
                    "local", // expected TEST_APP_ENV
                    "localBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 2
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env.json": "{\"TEST_FOO\": \"bar\"}",
                            ".env.local.json": "{\"TEST_FOO\": \"localBAR\"}",
                            ".env.dev.json": "{\"TEST_FOO\": \"devBAR\"}",
                        },
                    }, "dev", // expected TEST_APP_ENV
                    "devBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 3
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env.json": "{\"TEST_FOO\": \"bar\"}",
                            ".env.local.json": "{\"TEST_FOO\": \"localBAR\"}",
                            ".env.dev.json": "{\"TEST_FOO\": \"devBAR\"}",
                            ".env.dev.local.json": "{\"TEST_FOO\": \"devLocalBAR\"}",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "devLocalBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 4
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env.local.json": "{\"TEST_FOO\": \"localBAR\"}",
                            ".env.dev.json": "{\"TEST_FOO\": \"devBAR\"}",
                            ".env.dev.local.json": "{\"TEST_FOO\": \"devLocalBAR\"}",
                            ".env.dist.json": "{\"TEST_BAR\": \"distBAR\"}",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "devLocalBAR", // expected TEST_FOO
                    "distBAR", // expected TEST_BAR
                ],
            ];
        }

        // eslint-disable-next-line max-params
        each(getShouldLoadEnvTestData()).it("should load env with data set #%#", async (vars: { [key: string]: string }, filesystemConfig: DirectoryItems, expectedEnv: string, expectedFoo: string, expectedBar: string) => {
            // Prepare environment
            const environment = new ObjectEnvironment();

            for (const [key, value] of Object.entries(vars)) {
                environment.set(key, value);
            }

            // Mock the filesystem
            mockFs(filesystemConfig);

            // Act
            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.loadEnvironment("a/.env.json", "TEST_APP_ENV");

            // Assert
            expect(environment.get("TEST_APP_ENV")).toBe(expectedEnv);
            expect(environment.get("TEST_FOO")).toBe(expectedFoo);
            if (expectedBar !== undefined) {
                expect(environment.get("TEST_BAR")).toBe(expectedBar);
            }

            mockFs.restore();
        });

        it("should overload", async () => {
            const environment = new ObjectEnvironment({
                TEST_FOO: "initial_foo",
                TEST_BAR: "initial_bar",
            });

            mockFs({
                "a": {
                    ".env.json": "{\"TEST_FOO\": \"overloaded_foo\"}",
                },
                "b": {
                    ".env.json": "{\"TEST_BAR\": \"overloaded_bar\"}",
                },
            });

            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.overload("a/.env.json", "b/.env.json");

            expect(environment.get("TEST_FOO")).toBe("overloaded_foo");
            expect(environment.get("TEST_BAR")).toBe("overloaded_bar");

            mockFs.restore();
        });

    });

    describe("dot env", () => {

        it("should load", async () => {
            const environment = new ObjectEnvironment();

            mockFs({
                "a": {
                    ".env": "TEST_FOO=bar",
                },
                "b": {
                    ".env": "TEST_BAR=baz",
                },
            });

            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.load("a/.env");
            await environmentLoader.load("b/.env");

            expect(environment.get("TEST_FOO")).toBe("bar");
            expect(environment.get("TEST_BAR")).toBe("baz");

            mockFs.restore();
        });

        function getShouldLoadEnvTestData() {
            return [
                [ // data set 0
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env": "TEST_FOO=bar",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "bar", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 1
                    { // The key-value environment
                        TEST_APP_ENV: "local",
                    },
                    { // the fs mock config
                        "a": {
                            ".env": "TEST_FOO=bar",
                            ".env.local": "TEST_FOO=localBAR",
                        },
                    },
                    "local", // expected TEST_APP_ENV
                    "localBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 2
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env": "TEST_FOO=bar",
                            ".env.local": "TEST_FOO=localBAR",
                            ".env.dev": "TEST_FOO=devBAR",
                        },
                    }, "dev", // expected TEST_APP_ENV
                    "devBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 3
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env": "TEST_FOO=bar",
                            ".env.local": "TEST_FOO=localBAR",
                            ".env.dev": "TEST_FOO=devBAR",
                            ".env.dev.local": "TEST_FOO=devLocalBAR",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "devLocalBAR", // expected TEST_FOO
                    undefined, // expected TEST_BAR
                ],
                [ // data set 4
                    {}, // The key-value environment
                    { // the fs mock config
                        "a": {
                            ".env.local": "TEST_FOO=localBAR",
                            ".env.dev": "TEST_FOO=devBAR",
                            ".env.dev.local": "TEST_FOO=devLocalBAR",
                            ".env.dist": "TEST_BAR=distBAR",
                        },
                    },
                    "dev", // expected TEST_APP_ENV
                    "devLocalBAR", // expected TEST_FOO
                    "distBAR", // expected TEST_BAR
                ],
            ];
        }

        // eslint-disable-next-line max-params
        each(getShouldLoadEnvTestData()).it("should load env with data set #%#", async (vars: { [key: string]: string }, filesystemConfig: DirectoryItems, expectedEnv: string, expectedFoo: string, expectedBar: string) => {
            // Prepare environment
            const environment = new ObjectEnvironment();

            for (const [key, value] of Object.entries(vars)) {
                environment.set(key, value);
            }

            // Mock the filesystem
            mockFs(filesystemConfig);

            // Act
            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.loadEnvironment("a/.env", "TEST_APP_ENV");

            // Assert
            expect(environment.get("TEST_APP_ENV")).toBe(expectedEnv);
            expect(environment.get("TEST_FOO")).toBe(expectedFoo);
            if (expectedBar !== undefined) {
                expect(environment.get("TEST_BAR")).toBe(expectedBar);
            }

            mockFs.restore();
        });

        it("should overload", async () => {
            const environment = new ObjectEnvironment({
                TEST_FOO: "initial_foo",
                TEST_BAR: "initial_bar",
            });

            mockFs({
                "a": {
                    ".env": "TEST_FOO=overloaded_foo",
                },
                "b": {
                    ".env": "TEST_BAR=overloaded_bar",
                },
            });

            const environmentLoader = new EnvironmentLoader(environment);

            await environmentLoader.overload("a/.env", "b/.env");

            expect(environment.get("TEST_FOO")).toBe("overloaded_foo");
            expect(environment.get("TEST_BAR")).toBe("overloaded_bar");

            mockFs.restore();
        });

    });

    it("should not load directory", async () => {
        const environment = new ObjectEnvironment();

        expect.assertions(1);
        mockFs({
            "a": {
                ".env.json": "{\"TEST_FOO\": \"overloaded_foo\"}",
            },
        });

        const environmentLoader = new EnvironmentLoader(environment);

        try {
            await environmentLoader.load("a");
        } catch (exception) {
            expect(exception).toHaveProperty("message", "Unable to read the \"a\" environment file.");
        } finally {
            mockFs.restore();
        }
    });

    it("should not override env vars", () => {
        const environment = new ObjectEnvironment({ TEST_ENV_VAR: "original_value" });

        const environmentLoader = new EnvironmentLoader(environment);

        environmentLoader.populate({ TEST_ENV_VAR: "new_value" });

        expect(environment.get("TEST_ENV_VAR")).toBe("original_value");
    });

    it("should override env vars", () => {
        const environment = new ObjectEnvironment({ TEST_ENV_VAR: "original_value" });

        const environmentLoader = new EnvironmentLoader(environment);

        environmentLoader.populate({ TEST_ENV_VAR: "new_value" }, true);

        expect(environment.get("TEST_ENV_VAR")).toBe("new_value");
    });

    it("should memorize loaded vars in special var", () => {
        const environment = new ObjectEnvironment();

        const environmentLoader = new EnvironmentLoader(environment);

        environmentLoader.populate({ TEST_FOO: "original_foo", TEST_BAR: "original_bar" });

        expect(environment.get("ENVIRONMENT_VARS")).toBe("TEST_FOO,TEST_BAR");

        environment.set("ENVIRONMENT_VARS", "TEST_APP_ENV");
        environment.set("TEST_FOO", "new_foo");
        environment.unset("TEST_BAR");

        environmentLoader.populate({ TEST_FOO: "latest_foo", TEST_BAR: "latest_bar" });
        environmentLoader.populate({ TEST_BAR: "latest_bar" });

        expect(environment.get("ENVIRONMENT_VARS")).toBe("TEST_APP_ENV,TEST_BAR");
    });

    it("should override memorized names", () => {
        const environment = new ObjectEnvironment({
            ENVIRONMENT_VARS: "TEST_FOO,TEST_BAR",
            TEST_FOO: "original_foo",
            TEST_BAR: "original_bar",
            TEST_BAZ: "original_baz",
        });

        const environmentLoader = new EnvironmentLoader(environment);

        environmentLoader.populate({
            TEST_FOO: "new_foo",
            TEST_BAR: "new_bar",
            TEST_BAZ: "new_baz",
        });

        expect(environment.get("TEST_FOO")).toBe("new_foo");
        expect(environment.get("TEST_BAR")).toBe("new_bar");
        expect(environment.get("TEST_BAZ")).toBe("original_baz");
        expect(environment.get("ENVIRONMENT_VARS")).toBe("TEST_FOO,TEST_BAR");
    });

});
