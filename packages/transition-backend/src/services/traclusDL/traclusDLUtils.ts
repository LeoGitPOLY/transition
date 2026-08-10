import fs from 'fs';
import { MappingTraclusDLOdDemandFromCsvAttributes, TraclusDLOdDemandFromCsvAttributes } from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { OdTripCsvMapping, parseOdTripsFromCsvStream } from '../odTrip/odTripProvider';
import { Transform } from 'stream';

const CORRIDOR_MAPPING: TraclusDLOdDemandFromCsvAttributes = {
    projection: '2950',
    id: 'id',
    weight: 'weight',
    originLat: 'yorigin',
    originLon: 'xorigin',
    destinationLat: 'ydestination',
    destinationLon: 'xdestination',

};


export const getGeoJsonFromInputCsvFile = async (
    absoluteUserDir: string,
    csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes
): Promise<GeoJSON.FeatureCollection<GeoJSON.MultiLineString>> => {
    const csvFilePath = `${absoluteUserDir}/${TraclusDLConstants.CSV_FILE_NAME}`;
    const fieldMappings = csvFileMapping.fileAndMapping.fieldMappings;

    console.log(`Getting GeoJSON from CSV file at path: ${csvFilePath} with field mappings:`, fieldMappings);
    return await getGeoJsonFromFilePath(csvFilePath, fieldMappings);
};

export const getGeoJsonFromCorridorCsvFile = async (
    absoluteCorridorDir: string
): Promise<GeoJSON.FeatureCollection<GeoJSON.MultiLineString>> => {
    return await getGeoJsonFromFilePath(absoluteCorridorDir, CORRIDOR_MAPPING);
};

// Maximum number of returned lines to display in the GeoJSON output
const MAX_DISPLAY_LINES = 10000;

// Rounds a coordinate to 5 decimal places to reduce the size of the GeoJSON output
const roundCoordinate = (value: number): number => Math.round(value * 1e5) / 1e5;

const getGeoJsonFromFilePath = async (
    absoluteCsvPath: string,
    fieldMappings: TraclusDLOdDemandFromCsvAttributes
): Promise<GeoJSON.FeatureCollection<GeoJSON.MultiLineString>> => {
    if (!fs.existsSync(absoluteCsvPath)) {
        throw new Error(`CSV file does not exist at path: ${absoluteCsvPath}`);
    }

    const csvStream = fs.createReadStream(absoluteCsvPath);

    // Cast into OdTripCsvMapping to reuse the existing parseOdTripsFromCsvStream function
    // TODO (LEO): this cheat is not ideal, should create a new class to handle General OD
    const odTripCsvMapping: OdTripCsvMapping = {
        ...(fieldMappings as unknown as OdTripCsvMapping),
        time: 'weight', // reuse an existing numeric column
        timeType: 'departure',
        timeFormat: 'seconds'
    };

    const { odTrips, errors } = await parseOdTripsFromCsvStream(csvStream, odTripCsvMapping);
    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    // Convert to GeoJSON MultiLineString, limiting the number of lines to MAX_DISPLAY_LINES
    const multiLineStrings: number[][][] = [];
    for (const odTrip of odTrips) {
        if (multiLineStrings.length >= MAX_DISPLAY_LINES) {
            break;
        }

        const origin = odTrip.attributes.origin_geography.coordinates;
        const destination = odTrip.attributes.destination_geography.coordinates;

        multiLineStrings.push([
            [roundCoordinate(origin[0]), roundCoordinate(origin[1])],
            [roundCoordinate(destination[0]), roundCoordinate(destination[1])]
        ]);
    }

    console.log(`Parsed ${multiLineStrings.length} lines from CSV file into GeoJSON MultiLineString.`);
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    totalLines: multiLineStrings.length
                },
                geometry: {
                    type: 'MultiLineString',
                    coordinates: multiLineStrings
                }
            }
        ]
    };
};
