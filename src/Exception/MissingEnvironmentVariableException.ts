/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import { RuntimeException } from "./RuntimeException";

export class MissingEnvironmentVariableException extends RuntimeException {

    public constructor(variable: string) {
        super(`Missing environment variable "${variable}".`);
    }

}
