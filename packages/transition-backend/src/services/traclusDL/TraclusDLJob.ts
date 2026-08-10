/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import {
    MappingTraclusDLOdDemandFromCsvAttributes,
    TraclusDLCalculationResult,
    TraclusDLInputParameters
} from 'transition-common/lib/services/traclusDL/type';

export type TraclusDLJobType = {
    name: 'traclusDL';
    data: {
        parameters: {
            demandAttributes: MappingTraclusDLOdDemandFromCsvAttributes;
            inputParameters: TraclusDLInputParameters;
        };
        results: TraclusDLCalculationResult;
    };
    files: { input: true, segments: true, corridors: true };
};
