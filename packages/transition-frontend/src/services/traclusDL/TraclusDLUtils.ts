/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import serviceLocator from 'chaire-lib-common/lib/utils/ServiceLocator';
import * as Status from 'chaire-lib-common/lib/utils/Status';
import TrError from 'chaire-lib-common/lib/utils/TrError';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { TraclusDLOdDemandFromCsv } from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';
import {
    MappingTraclusDLOdDemandFromCsvAttributes,
    TraclusDLInputParameters
} from 'transition-common/lib/services/traclusDL/type';

export class TraclusDLUtils {
    static async runCalculation(
        demand: TraclusDLOdDemandFromCsv,
        parameters: TraclusDLInputParameters
    ): Promise<number> {
        const csvFileMapping = this._getValidDemandMapping(demand);

        try {
            return await TraclusDLUtils._runBackEndCalculation(csvFileMapping, parameters);
        } catch (error) {
            if (TrError.isTrError(error)) {
                throw error;
            }
            throw new TrError(
                `cannot calculate TraClus-DL: ${error}`,
                'TRACAL0004',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }
    }

    static async getGeoJsonFromCsvFile(demand: TraclusDLOdDemandFromCsv): Promise<GeoJSON.FeatureCollection> {
        const csvFileMapping = this._getValidDemandMapping(demand);
        try {
            return await this._getBackendGeoJsonFromCsvFile(csvFileMapping);
        } catch (error) {
            if (TrError.isTrError(error)) {
                throw error;
            }
            throw new TrError(
                `Cannot get GeoJSON from CSV file: ${error}`,
                'TRACAL0005',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }
    }

    private static async _runBackEndCalculation(
        csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes,
        parameters: TraclusDLInputParameters
    ): Promise<number> {
        return new Promise((resolve, reject) => {
            serviceLocator.socketEventManager.emit(
                TraclusDLConstants.RUN_CALCULATION,
                csvFileMapping,
                parameters,
                (result: Status.Status<number>) => {
                    if (Status.isStatusOk(result)) {
                        resolve(Status.unwrap(result));
                    } else {
                        reject(result.error);
                    }
                }
            );
        });
    }

    private static async _getBackendGeoJsonFromCsvFile(
        csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes
    ): Promise<GeoJSON.FeatureCollection> {
        return new Promise((resolve, reject) => {
            serviceLocator.socketEventManager.emit(
                TraclusDLConstants.GET_GEOJSON_FROM_CSV_FILE,
                csvFileMapping,
                (result: Status.Status<GeoJSON.FeatureCollection>) => {
                    if (Status.isStatusOk(result)) {
                        resolve(Status.unwrap(result));
                    } else {
                        reject(result.error);
                    }
                }
            );
        });
    }

    private static _getValidDemandMapping(demand: TraclusDLOdDemandFromCsv): MappingTraclusDLOdDemandFromCsvAttributes {
        if (!demand.isValid()) {
            throw new TrError(
                'cannot run TraClus-DL calculation: the CSV file data is invalid',
                'TRACAL0001',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }

        const csvFileMapping = demand.getCurrentFileAndMapping();
        if (!csvFileMapping) {
            throw new TrError(
                'cannot run TraClus-DL calculation: demand parameters not set',
                'TRACAL0003',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }
        return csvFileMapping;
    }
}
