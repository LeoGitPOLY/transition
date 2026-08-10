/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

export class TraclusDLConstants {
    /**
     * The name of the TraClus-DL module.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly MODULE_NAME = 'traclusDL';

    /**
     * Socket route name to run a TraClus-DL calculation. Takes a parameter
     * of type `{ demand: TraclusDLOdDemandFromCsv, parameters: TraclusDLInputParameters }` and returns a `Status<TraclusDLCalculationResult>` on success.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly RUN_CALCULATION = this.MODULE_NAME + '.runCalculation';

    /**
     * Socket route name to get GeoJSON from a CSV file. Takes a parameter
     * of type `{ csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes }` and returns a `Status<GeoJSON.FeatureCollection>` on success.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly GET_GEOJSON_FROM_CSV_FILE = this.MODULE_NAME + '.getGeoJsonFromCsvFile';

    /**
     * The name of the CSV file for TraClus-DL.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly CSV_FILE_NAME = this.MODULE_NAME + '.csv';

    /**
     * The name of the corridors file for TraClus-DL.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly CORRIDORS_FILE_NAME = this.MODULE_NAME + '.corridors.txt';

    /**
     * The name of the segments file for TraClus-DL.
     *
     * @static
     * @memberof TraclusDLConstants
     */
    static readonly SEGMENTS_FILE_NAME = this.MODULE_NAME + '.segments.txt';
}
