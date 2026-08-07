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

export const defaultParameters: TraclusDLInputParameters = {
    maxAngle: 5,
    minDensity: 20,
    maxDistance: 600,
    segSize: 2000,
    isParallel: true
};

export type TraclusDLCalculationResult = {
    completed: boolean;
    percentComplete: number;
    consoleOutput: string;
    // corridorGeoson: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    // segmentsGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    // TODO (LEO) : add later the other parameters
};

export const defaultResult: TraclusDLCalculationResult = {
    completed: false,
    percentComplete: 0,
    consoleOutput: ''
};

export type TraclusDLOdDemandFromCsvAttributes = {
    projection: string;
    id: string;
    weight: string;
    originLat: string;
    originLon: string;
    destinationLat: string;
    destinationLon: string;
};

export type MappingTraclusDLOdDemandFromCsvAttributes = CsvFileAndMapping<TraclusDLOdDemandFromCsvAttributes>;
