import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

const DEFAULT_RUST_IMPL_DIR = ''; // TODO (LEO) : add path to /bin folder (depending how to build it)
const RUST_IMPL_DIR = process.env.TR_TRACLUS_DL_PATH || DEFAULT_RUST_IMPL_DIR;

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
