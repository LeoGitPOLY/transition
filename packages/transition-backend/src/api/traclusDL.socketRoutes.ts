/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import { EventEmitter } from 'events';

import * as Status from 'chaire-lib-common/lib/utils/Status';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import {
    defaultResult,
    MappingTraclusDLOdDemandFromCsvAttributes,
    TraclusDLInputParameters
} from 'transition-common/lib/services/traclusDL/type';
import { ExecutableJobUtils } from '../services/executableJob/ExecutableJobUtils';
import { fileKey } from 'transition-common/lib/services/jobs/Job';
import { TraclusDLJobType } from '../services/traclusDL/TraclusDLJob';
import { ExecutableJob } from '../services/executableJob/ExecutableJob';
import { getGeoJsonFromInputCsvFile } from '../services/traclusDL/traclusDLUtils';
import { directoryManager } from 'chaire-lib-backend/lib/utils/filesystem/directoryManager';

export default function (socket: EventEmitter, userId: number) {
    const absoluteImportDir = `${directoryManager.userDataDirectory}/${userId}/imports`;

    // Run a Traclus-DL calculation: return the job ID of the calculation job created
    socket.on(
        TraclusDLConstants.RUN_CALCULATION,
        async (
            csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes,
            parameters: TraclusDLInputParameters,
            callback: (status: Status.Status<number>) => void
        ) => {
            try {
                socket.emit('progress', { name: 'TraclusDL', progress: null });

                const inputFiles: {
                    [Property in keyof TraclusDLJobType[fileKey]]?: string | { filepath: string; renameTo: string };
                } = {};
                inputFiles.input = await ExecutableJobUtils.prepareJobFiles(
                    csvFileMapping.fileAndMapping.csvFile,
                    userId
                );

                const job: ExecutableJob<TraclusDLJobType> = await ExecutableJob.createJob({
                    user_id: userId,
                    name: 'traclusDL',
                    data: {
                        parameters: {
                            demandAttributes: csvFileMapping,
                            inputParameters: parameters
                        },
                        results: { ...defaultResult }
                    },
                    inputFiles
                });

                await job.enqueue();
                await job.refresh();

                callback(Status.createOk(job.attributes.id));
            } catch (error) {
                callback(Status.createError(error instanceof Error ? error.message : 'ServerError running TraClus-DL'));
            }
        }
    );

    // Get GeoJSON from a CSV input file: return a GeoJSON FeatureCollection of Linestrings
    socket.on(
        TraclusDLConstants.GET_GEOJSON_FROM_CSV_FILE,
        async (
            csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes,
            callback: (status: Status.Status<GeoJSON.FeatureCollection>) => void
        ) => {
            try {
                const csvFilePath = `${absoluteImportDir}/${TraclusDLConstants.CSV_FILE_NAME}`;
                const geoJson = await getGeoJsonFromInputCsvFile(csvFilePath, csvFileMapping.fileAndMapping.fieldMappings, 'imported');
                callback(Status.createOk(geoJson));
            } catch (error) {
                callback(Status.createError(error instanceof Error ? error.message : 'ServerError getting GeoJSON'));
            }
        }
    );
}
