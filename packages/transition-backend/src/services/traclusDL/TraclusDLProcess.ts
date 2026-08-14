import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import {
    TraclusDLInputParameters,
    TraclusDLOdDemandFromCsvAttributes
} from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';

const execFileAsync = promisify(execFile);

const DEFAULT_RUST_IMPL_DIR = ''; // TODO (LEO) : add path to /bin folder (depending how to build it)
const RUST_IMPL_DIR = process.env.TR_TRACLUS_DL_PATH || DEFAULT_RUST_IMPL_DIR;

export const runRustImplOnce = async (
    filePath: string,
    fieldMappings: TraclusDLOdDemandFromCsvAttributes,
    parameters: TraclusDLInputParameters
): Promise<{ stdout: string; stderr: string }> => {
    const exe = path.join(RUST_IMPL_DIR, 'traclusdl_cli');
    const computationMapping = getComputationMapping(fieldMappings);

    //TODO: For now, we always use the parallel mode. In the future, we can chose the number of CPU cores to use
    const mode = 'parallel-rayon';

    const cmdArgs: string[] = [
        '--file',
        filePath,
        '--output',
        TraclusDLConstants.MODULE_NAME,
        '--max_dist',
        parameters.maxDistance.toString(),
        '--min_density',
        parameters.minDensity.toString(),
        '--max_angle',
        parameters.maxAngle.toString(),
        '--segment_size',
        parameters.segSize.toString(),
        '--mode',
        mode,
        '--map',
        computationMapping,
        '--interface',
        'performance'
    ];

    return await execFileAsync(exe, cmdArgs);
};

// This is the exact name of fields traclusDl executable expects in the mapping file
// It is used to override the fields of CsvFieldMappingDescriptor for computation
const EXECUTABLE_FIELDS_MAPPING: TraclusDLOdDemandFromCsvAttributes = {
    projection: '',
    id: 'name',
    weight: 'weight',
    originLat: 'yorigin',
    originLon: 'xorigin',
    destinationLat: 'ydest',
    destinationLon: 'xdest'
};

// Function to convert the field mappings from the frontend to the format expected by the Rust implementation
const getComputationMapping = (fieldMappings: TraclusDLOdDemandFromCsvAttributes): string => {
    const computationMapping = Object.entries(fieldMappings).reduce(
        (acc, [key, value]) => {
            const executableKey = EXECUTABLE_FIELDS_MAPPING[key as keyof TraclusDLOdDemandFromCsvAttributes];

            if (executableKey) {
                acc[executableKey] = value;
            }

            return acc;
        },
        {} as Record<string, string>
    );
    return JSON.stringify(computationMapping);
};
