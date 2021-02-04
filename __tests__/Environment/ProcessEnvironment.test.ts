/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { ProcessEnvironment } from "../../src/Environment/ProcessEnvironment";

describe("ProcessEnvironment Tests", () => {

    function cleanup() {
        for (const [key] of Object.entries(process.env)) {
            if (key.startsWith("TEST_")) {
                delete process.env[key];
            }
        }
    }

    beforeEach(cleanup);
    afterEach(cleanup);

    test("the 'has' method should correctly check if the environment variable exist", () => {
        process.env.TEST_FOO = "bar";

        const environment = new ProcessEnvironment();

        expect(environment.has("TEST_FOO")).toBeTruthy();
        expect(environment.has("TEST_BAR")).toBeFalsy();

        process.env.TEST_BAR = "foo";
        delete process.env.TEST_FOO;

        expect(environment.has("TEST_FOO")).toBeFalsy();
        expect(environment.has("TEST_BAR")).toBeTruthy();
    });

    test("the 'get' method should correctly return the existing environment variable", () => {
        process.env.TEST_FOO = "bar";

        const environment = new ProcessEnvironment();

        expect(environment.get("TEST_FOO")).toBe("bar");

        process.env.TEST_BAR = "foo";

        expect(environment.get("TEST_BAR")).toBe("foo");
    });

    test("the 'get' method should fail if the environment variable does not exist", () => {
        const environment = new ProcessEnvironment();

        expect(() => {
            environment.get("TEST_FOO");
        }).toThrow("Missing environment variable \"TEST_FOO\"");
    });

    test("the 'set' method should set a variable", () => {
        const environment = new ProcessEnvironment();

        environment.set("TEST_FOO", "foo");

        expect(environment.get("TEST_FOO")).toBe("foo");
    });

    test("the 'set' method should overwrite a variable", () => {
        process.env.TEST_FOO = "bar";

        const environment = new ProcessEnvironment();

        expect(environment.get("TEST_FOO")).toBe("bar");

        environment.set("TEST_FOO", "foo");

        expect(environment.get("TEST_FOO")).toBe("foo");
    });

    test("the 'unset' method should delete a variable", () => {
        const environment = new ProcessEnvironment();

        expect(environment.has("TEST_FOO")).toBeFalsy();

        environment.set("TEST_FOO", "foo");

        expect(environment.has("TEST_FOO")).toBeTruthy();

        environment.unset("TEST_FOO");

        expect(environment.has("TEST_FOO")).toBeFalsy();
    });

});
