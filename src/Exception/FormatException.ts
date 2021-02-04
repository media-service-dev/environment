/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2021 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

import * as util from "util";

import { FormatExceptionContext } from "./FormatExceptionContext";
import { LogicException } from "./LogicException";

export class FormatException extends LogicException {

    protected context: FormatExceptionContext;

    public constructor(message: string, context: FormatExceptionContext) {
        super(util.format("%s in \"%s\" at line %d.\n%s", message, context.getPath(), context.getLine(), context.getDetails()));
        this.context = context;
    }

    public getContext(): FormatExceptionContext {
        return this.context;
    }

}
