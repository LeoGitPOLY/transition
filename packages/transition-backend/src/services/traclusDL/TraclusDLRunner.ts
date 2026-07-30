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
    // RUN CODE HERE
    console.log('Running TraClus-DL calculation (!)');
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
            // TODO (LEO) : Implement the actual calculation here
            const filePath = this.job.getFilePath('input');
            const mapping = this.job.attributes.data.parameters.demandAttributes.fileAndMapping.fieldMappings;
            const mapping2 = this.job.attributes.data.parameters.demandAttributes.csvFields;
            const type = this.job.attributes.data.parameters.demandAttributes.type;
            console.log('TraClus-DL calculation: filePath', filePath);
            console.log('TraClus-DL calculation: mapping', mapping);
            console.log('TraClus-DL calculation: mapping2', mapping2);
            console.log('TraClus-DL calculation: type', type);

            const { stdout, stderr } = await runRustImplOnce({
                filePath,
                maxDist: '100',
                minDensity: '5',
                maxAngle: '10',
                segSize: '10',
                mode: 'serial'
            });

            if (stderr) {
                console.error(`TraClus-DL stderr: ${stderr}`);
            }
            console.log(`TraClus-DL stdout: ${stdout}`);
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
