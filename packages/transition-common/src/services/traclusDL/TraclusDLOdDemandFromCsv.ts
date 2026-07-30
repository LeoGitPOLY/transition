/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import { CsvFieldMappingDescriptor, CsvFileAndFieldMapper } from '../csv';
import { MappingTraclusDLOdDemandFromCsvAttributes, TraclusDLOdDemandFromCsvAttributes } from './type';

const demandFieldDescriptors: CsvFieldMappingDescriptor[] = [
    {
        key: 'name',
        i18nLabel: 'transit:traclusDL:IdField',
        type: 'single',
        required: false
    },
    {
        key: 'weight',
        i18nLabel: 'transit:traclusDL:WeightField',
        i18nErrorLabel: 'transit:traclusDL:error:WeightFieldIsMissing',
        type: 'single',
        required: true
    },
    // TODO (LEO): X and Y could be Projected Coordinates (another type : not latLon)
    {
        key: 'x_origin',
        i18nLabel: 'transit:traclusDL:XOriginField',
        i18nErrorLabel: 'transit:traclusDL:error:XOriginFieldIsMissing',
        type: 'single',
        required: true
    },
    {
        key: 'y_origin',
        i18nLabel: 'transit:traclusDL:YOriginField',
        i18nErrorLabel: 'transit:traclusDL:error:YOriginFieldIsMissing',
        type: 'single',
        required: true
    },
    {
        key: 'x_dest',
        i18nLabel: 'transit:traclusDL:XDestinationField',
        i18nErrorLabel: 'transit:traclusDL:error:XDestinationFieldIsMissing',
        type: 'single',
        required: true
    },
    {
        key: 'y_dest',
        i18nLabel: 'transit:traclusDL:YDestinationField',
        i18nErrorLabel: 'transit:traclusDL:error:YDestinationFieldIsMissing',
        type: 'single',
        required: true
    }
];

/**
 * Describe a CSV file field mapping for a transition origin/destination pair file
 */
export class TraclusDLOdDemandFromCsv extends CsvFileAndFieldMapper<TraclusDLOdDemandFromCsvAttributes> {
    constructor(csvFileAndMapping?: MappingTraclusDLOdDemandFromCsvAttributes | undefined) {
        super(demandFieldDescriptors, csvFileAndMapping);
    }
}

export default TraclusDLOdDemandFromCsv;
