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
import { ReturnedJobAttributes } from '../../components/parts/executableJob/ExecutableJobList';
import { JobsConstants } from 'transition-common/lib/api/jobs';

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
    static async getCalculationResultsByJobId(jobId: number): Promise<TraclusDLCalculationResult> {
        try {
            return await this._getBackendCalculationResultsByJobId(jobId);
        } catch (error) {
            if (TrError.isTrError(error)) {
                throw error;
            }
            throw new TrError(
                `Cannot get TraClus-DL results for job ${jobId}: ${error}`,
                'TRACAL0006',
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

    private static async _getBackendCalculationResultsByJobId(
        jobId: number
    ): Promise<TraclusDLCalculationResult> {
        return new Promise((resolve, reject) => {
            serviceLocator.socketEventManager.emit(
                JobsConstants.LIST_JOBS,
                { jobType: 'traclusDL', pageSize: 0 },
                (response: Status.Status<{ jobs: ReturnedJobAttributes[]; totalCount: number }>) => {
                    try {
                        const { jobs } = Status.unwrap(response);
                        if (!jobs) { throw new Error('No jobs found'); }

                        const job = jobs.find((j) => j.id === jobId);
                        if (!job) { throw new Error('Job not found'); }

                        const jobStatus = job.status;
                        if (jobStatus !== 'completed' && jobStatus !== 'failed') {
                            throw new Error(`Job is not completed or failed, current status: ${jobStatus}`);
                        }
                        const results = job.data.results as TraclusDLCalculationResult;
                        if (!results) { throw new Error('No results found for the job'); }

                        resolve(results);
                    } catch (error) {
                        reject(error);
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
