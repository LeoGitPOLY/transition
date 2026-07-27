/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

export class TraclusDLConstants {
    /**
     * Socket route name to run a TraClus-DL calculation. Takes a parameter
     * of type `{ demand: TraclusDLOdDemandFromCsv, parameters: TraclusDLInputParameters }` and returns a `Status<TraclusDLCalculationResult>` on success.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly RUN_CALCULATION = 'traclusDL.runCalculation';
}
