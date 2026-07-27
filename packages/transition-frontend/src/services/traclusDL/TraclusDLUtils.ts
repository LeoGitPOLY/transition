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
    TraclusDLCalculationResult,
    TraclusDLInputParameters
} from 'transition-common/lib/services/traclusDL/type';

export class TraclusDLUtils {
    static async runCalculation(
        demand: TraclusDLOdDemandFromCsv,
        parameters: TraclusDLInputParameters
    ): Promise<TraclusDLCalculationResult> {
        if (!demand.isValid()) {
            throw new TrError(
                'cannot calculate TraClus-DL calculation: the CSV file data is invalid',
                'TRACAL0001',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }
        // TODO (LEO) : Add parameters validation here

        const csvFileMapping = demand.getCurrentFileAndMapping();
        if (!csvFileMapping) {
            throw new TrError(
                'cannot calculate TraClus-DL: demand parameters not set',
                'TRACAL0003',
                'transit:transitRouting:errors:TransitBatchRouteCannotBeCalculatedBecauseError'
            );
        }

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

    private static async _runBackEndCalculation(
        csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes,
        parameters: TraclusDLInputParameters
    ): Promise<TraclusDLCalculationResult> {
        return new Promise((resolve, reject) => {
            serviceLocator.socketEventManager.emit(
                TraclusDLConstants.RUN_CALCULATION,
                csvFileMapping,
                parameters,
                (result: Status.Status<TraclusDLCalculationResult>) => {
                    if (Status.isStatusOk(result)) {
                        resolve(Status.unwrap(result));
                    } else {
                        reject(result.error);
                    }
                }
            );
        });
    }
}
