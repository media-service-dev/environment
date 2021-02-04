/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { ObjectEnvironment } from "../../src/Environment/ObjectEnvironment";

describe("ObjectEnvironment Tests", () => {

    test("the 'has' method should correctly check if the environment variable exist", () => {
        const environment = new ObjectEnvironment({ TEST_FOO: "bar" });

        expect(environment.has("TEST_FOO")).toBeTruthy();
        expect(environment.has("TEST_BAR")).toBeFalsy();

        (environment as any).variables = { TEST_BAR: "foo" };

        expect(environment.has("TEST_FOO")).toBeFalsy();
        expect(environment.has("TEST_BAR")).toBeTruthy();
    });

    test("the 'get' method should correctly return the existing environment variable", () => {
        const environment = new ObjectEnvironment({ TEST_FOO: "bar" });

        expect(environment.get("TEST_FOO")).toBe("bar");

        (environment as any).variables = { TEST_BAR: "foo" };

        expect(environment.get("TEST_BAR")).toBe("foo");
    });

    test("the 'get' method should fail if the environment variable does not exist", () => {
        const environment = new ObjectEnvironment();

        expect(() => {
            environment.get("TEST_FOO");
        }).toThrow("Missing environment variable \"TEST_FOO\"");
    });

    test("the 'set' method should set a variable", () => {
        const environment = new ObjectEnvironment();

        environment.set("TEST_FOO", "foo");

        expect(environment.get("TEST_FOO")).toBe("foo");
    });

    test("the 'set' method should overwrite a variable", () => {
        const environment = new ObjectEnvironment({ TEST_FOO: "bar" });

        expect(environment.get("TEST_FOO")).toBe("bar");

        environment.set("TEST_FOO", "foo");

        expect(environment.get("TEST_FOO")).toBe("foo");
    });

    test("the 'unset' method should delete a variable", () => {
        const environment = new ObjectEnvironment();

        expect(environment.has("TEST_FOO")).toBeFalsy();

        environment.set("TEST_FOO", "foo");

        expect(environment.has("TEST_FOO")).toBeTruthy();

        environment.unset("TEST_FOO");

        expect(environment.has("TEST_FOO")).toBeFalsy();
    });

});
