/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

export class TraclusDLConstants {
    /**
     * Socket route name to run a TraClus-DL test call. Takes a parameter
     * of type `{ input: string }` and returns a `Status<string>` on success.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly RUN_TEST = 'traclusDL.runTest';
}
