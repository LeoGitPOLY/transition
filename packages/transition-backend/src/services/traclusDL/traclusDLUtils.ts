import fs from 'fs';
import { MappingTraclusDLOdDemandFromCsvAttributes } from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { OdTripCsvMapping, parseOdTripsFromCsvStream } from '../odTrip/odTripProvider';

const MAX_DISPLAY_LINES = 25000;

const roundCoordinate = (value: number): number => Math.round(value * 1e5) / 1e5;

export const getGeoJsonFromCsvFile = async (
    absoluteUserDir: string,
    csvFileMapping: MappingTraclusDLOdDemandFromCsvAttributes
): Promise<GeoJSON.FeatureCollection<GeoJSON.MultiLineString>> => {
    const csvFilePath = `${absoluteUserDir}/${TraclusDLConstants.CSV_FILE_NAME}`;
    if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file does not exist at path: ${csvFilePath}`);
    }

    const csvStream = fs.createReadStream(csvFilePath);

    // Cast into OdTripCsvMapping to use the existing parseOdTripsFromCsvStream function
    // TODO (LEO) : this cheat is not ideal, should create a new class to handle General OD
    const fieldMappings = csvFileMapping.fileAndMapping.fieldMappings;
    const odTripCsvMapping: OdTripCsvMapping = {
        ...(fieldMappings as unknown as OdTripCsvMapping),
        time: 'weight', // reuse an existing numeric column
        timeType: 'departure',
        timeFormat: 'seconds'
    };
    const { odTrips, errors } = await parseOdTripsFromCsvStream(csvStream, odTripCsvMapping);
    if (errors.length > 0) {
        throw new Error(`${errors.join(', ')}`);
    }

    const sampledLines: number[][][] = [];
    odTrips.forEach((odTrip) => {
        const origin = odTrip.attributes.origin_geography.coordinates;
        const destination = odTrip.attributes.destination_geography.coordinates;
        const lineString: number[][] = [
            [roundCoordinate(origin[0]), roundCoordinate(origin[1])],
            [roundCoordinate(destination[0]), roundCoordinate(destination[1])]
        ];
        sampledLines.push(lineString);
    });

    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    displayedLines: sampledLines.length,
                    totalLines: sampledLines.length
                },
                geometry: {
                    type: 'MultiLineString',
                    coordinates: sampledLines
                }
            }
        ]
    };
};
