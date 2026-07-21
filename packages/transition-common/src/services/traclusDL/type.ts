import { CsvFileAndMapping } from '../csv';

/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
export type TraclusDLOdDemandFromCsvAttributes = {
    projection: string;
    id: string;
    weight: string;
    xOrigin: string;
    yOrigin: string;
    xDestination: string;
    yDestination: string;
};

export type MappingTraclusDLOdDemandFromCsvAttributes = CsvFileAndMapping<TraclusDLOdDemandFromCsvAttributes>;
