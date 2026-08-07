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

    /**
     * Socket route name to get GeoJSON from a CSV file. Takes a parameter
     * of type `{ csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes }` and returns a `Status<GeoJSON.FeatureCollection>` on success.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly GET_GEOJSON_FROM_CSV_FILE = 'traclusDL.getGeoJsonFromCsvFile';

    /**
     * The name of the CSV file for TraClus-DL.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly CSV_FILE_NAME = 'traclusDL.csv';
}
