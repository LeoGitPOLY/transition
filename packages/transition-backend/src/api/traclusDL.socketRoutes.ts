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
    MappingTraclusDLOdDemandFromCsvAttributes,
    TraclusDLCalculationResult,
    TraclusDLInputParameters
} from 'transition-common/lib/services/traclusDL/type';
import { ExecutableJobUtils } from '../services/executableJob/ExecutableJobUtils';
import { fileKey } from 'transition-common/lib/services/jobs/Job';
import { TraclusDLJobType } from '../services/traclusDL/traclusDLJob';
import { ExecutableJob } from '../services/executableJob/ExecutableJob';

export default function (socket: EventEmitter, userId: number) {
    socket.on(
        TraclusDLConstants.RUN_CALCULATION,
        async (
            csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes,
            parameters: TraclusDLInputParameters,
            callback: (status: Status.Status<TraclusDLCalculationResult>) => void
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
                        results: {
                            completed: false,
                            textTest: ''
                        }
                    },
                    inputFiles
                });

                await job.enqueue();
                await job.refresh();

                callback(Status.createOk(job.attributes.data.results));
            } catch (error) {
                callback(Status.createError(error instanceof Error ? error.message : 'Error running TraClus-DL'));
            }
        }
    );
}
