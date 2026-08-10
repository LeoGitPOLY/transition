/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import { TraclusDLCalculationResult } from 'transition-common/lib/services/traclusDL/type';
import { ExecutableJob } from '../executableJob/ExecutableJob';
import { TraclusDLJobType } from './TraclusDLJob';
import { EventEmitter } from 'events';
import { runRustImplOnce } from './TraclusDLProcess';
import { getGeoJsonFromCorridorCsvFile } from './traclusDLUtils';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';

export const traclusDLCalculate = async (
    job: ExecutableJob<TraclusDLJobType>,
    options: {
        progressEmitter: EventEmitter;
        isCancelled: () => boolean;
    }
): Promise<TraclusDLCalculationResult> => {
    const runner = new TraclusDLRunner(job, options);
    return await runner.run();
};

class TraclusDLRunner {
    constructor(
        private job: ExecutableJob<TraclusDLJobType>,
        private options: {
            progressEmitter: EventEmitter;
            isCancelled: () => boolean;
        }
    ) {
        this.job = job;
        this.options = options;
    }

    run = async (): Promise<TraclusDLCalculationResult> => {
        this.job.registerOutputFile('segments', TraclusDLConstants.SEGMENTS_FILE_NAME);
        this.job.registerOutputFile('corridors', TraclusDLConstants.CORRIDORS_FILE_NAME);

        const filePath = this.job.getFilePath('input');
        const parameters = this.job.attributes.data.parameters.inputParameters;
        const fieldMappings = this.job.attributes.data.parameters.demandAttributes.fileAndMapping.fieldMappings;

        const stdout = await runRustImplOnce(filePath, fieldMappings, parameters);

        const corridorFilePath = this.job.getFilePath('corridors');
        const corridorGeoJson = await getGeoJsonFromCorridorCsvFile(corridorFilePath);

        return {
            consoleOutput: stdout.trim(),
            corridorGeoJson,
            completed: true
        };


    };
}
export default { runRustImplOnce };
