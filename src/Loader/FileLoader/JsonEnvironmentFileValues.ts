/*
 * This file is part of the @mscs/environment package.
 *
 * Copyright (c) 2020 media-service consulting & solutions GmbH
 *
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

/**
 * The parsed raw format of a `.env.json` file
 */
export interface JsonEnvironmentFileValues {
    [key: string]: string | JsonEnvironmentFileValues;
}
