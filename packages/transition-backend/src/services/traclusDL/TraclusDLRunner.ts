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
        try {
            const filePath = this.job.getFilePath('input');
            const parameters = this.job.attributes.data.parameters.inputParameters;
            const fieldMappings = this.job.attributes.data.parameters.demandAttributes.fileAndMapping.fieldMappings;

            const { stdout, stderr } = await runRustImplOnce(filePath, fieldMappings, parameters);

            if (stderr) {
                throw new Error(stderr);
            }

            return {
                completed: true,
                percentComplete: 100,
                consoleOutput: stdout.trim()
            };
        } catch (error) {
            console.error('Error running TraClus-DL calculation:', error);
            throw error;
        }
    };
}
export default { runRustImplOnce };
