import { CsvFileAndMapping } from '../csv';

/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

export type TraclusDLInputParameters = {
    maxAngle: number;
    minDensity: number;
    maxDistance: number;
    segSize: number;
    isParallel: boolean;
    // TODO (LEO) : add later the other parameters
};

export type TraclusDLCalculationResult = {
    completed: boolean;
    percentComplete: number;
    consoleOutput: string;
    // corridorGeoson: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    // segmentsGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    // TODO (LEO) : add later the other parameters
};

export type TraclusDLOdDemandFromCsvAttributes = {
    id: string;
    weight: string;
    xOrigin: string;
    yOrigin: string;
    xDestination: string;
    yDestination: string;
};

export type MappingTraclusDLOdDemandFromCsvAttributes = CsvFileAndMapping<TraclusDLOdDemandFromCsvAttributes>;
