/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import { TraclusDLCalculationResult } from 'transition-common/lib/services/traclusDL/type';
import { ExecutableJob } from '../executableJob/ExecutableJob';
import { TraclusDLJobType } from './traclusDLJob';
import { EventEmitter } from 'events';
import { readFile } from 'fs/promises';

export const traclusDLCalculationRoute = async (
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
        console.log('RUNNN');
        try {
            // TODO (LEO) : Implement the actual calculation here
            const filePath = this.job.getFilePath('input');

            const textFileContent = await this.job.getReadStream('input');
            console.log('Input file content:', textFileContent.read());

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
                textTest: stdout.trim()
            };
        } catch (error) {
            console.error('Error running TraClus-DL calculation:', error);
            throw error;
        }
    };
}

// TODO (LEO) : Move to a process class
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import config from 'chaire-lib-backend/lib/config/server.config';

const execFileAsync = promisify(execFile);

// Same convention discussed earlier for OSRM/trRouting: binaries live under
// runtime/, not inside the source tree, configurable via env var.
const RUST_IMPL_DIR = path.join(config.projectDirectory, 'traclusDL');

export type TraclusDLProcessArgs = {
    filePath: string;
    maxDist: string;
    minDensity: string;
    maxAngle: string;
    segSize: string;
    mode?: string; // 'serial' | 'parallel', matching the python arg
};

export const runRustImplOnce = async (args: TraclusDLProcessArgs): Promise<{ stdout: string; stderr: string }> => {
    const exe = path.join(RUST_IMPL_DIR, 'traclusdl_cli');

    const cmdArgs = [
        '--file',
        args.filePath,
        '--max_dist',
        args.maxDist,
        '--min_density',
        args.minDensity,
        '--max_angle',
        args.maxAngle,
        '--segment_size',
        args.segSize,
        '--mode',
        args.mode || 'serial',
        '--interface',
        'performance'
    ];

    const { stdout, stderr } = await execFileAsync(exe, cmdArgs);
    return { stdout, stderr };
};

export default { runRustImplOnce };
