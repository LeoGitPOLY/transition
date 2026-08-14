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
import { getGeoJsonFromCorridorCsvFile, getGeoJsonFromInputCsvFile } from './traclusDLUtils';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';

type TraclusDLFiles = {
    input?: string;
    segments?: string;
    corridors?: string;
};

export const traclusDLCalculate = async (
    job: ExecutableJob<TraclusDLJobType>,
    options: {
        progressEmitter: EventEmitter;
        isCancelled: () => boolean;
    }
): Promise<{
    results: TraclusDLCalculationResult;
    files: TraclusDLFiles;
    errors: string[];
}> => {
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

    run = async (): Promise<{
        results: TraclusDLCalculationResult;
        files: TraclusDLFiles;
        errors: string[];
    }> => {
        this.job.registerOutputFile('corridors', TraclusDLConstants.CORRIDORS_FILE_NAME);
        this.job.registerOutputFile('segments', TraclusDLConstants.SEGMENTS_FILE_NAME);

        this.options.progressEmitter.emit('progress', { name: 'traclusDL', progress: 0.0 });

        let results = this.job.attributes.data.results;
        const files: TraclusDLFiles = { input: this.job.getFileName('input') };
        try {
            const parameters = this.job.attributes.data.parameters.inputParameters;
            const fieldMappings = this.job.attributes.data.parameters.demandAttributes.fileAndMapping.fieldMappings;

            const { stdout, stderr } = await runRustImplOnce(this.job.getFilePath('input'), fieldMappings, parameters);
            const corridorGeoJson = await getGeoJsonFromCorridorCsvFile(this.job.getFilePath('corridors'));
            const inputGeoJson = await getGeoJsonFromInputCsvFile(this.job.getFilePath('input'), fieldMappings, 'job');

            results = {
                consoleOutput: stdout.trim(),
                corridorGeoJson,
                inputGeoJson,
                completed: true
            };

            files.segments = this.job.getFileName('segments');
            files.corridors = this.job.getFileName('corridors');

            return { results, files, errors: stderr ? [stderr] : [] };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { results, files, errors: [errorMessage] };
        } finally {
            this.options.progressEmitter.emit('progress', { name: 'traclusDL', progress: 1.0 });
        }
    };
}
export default { runRustImplOnce };
