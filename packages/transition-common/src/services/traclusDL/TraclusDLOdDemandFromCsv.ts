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
    {
        key: 'origin',
        type: 'latLon',
        i18nLabel: 'transit:transitRouting:OriginFieldMapping',
        i18nErrorLabel: 'transit:transitRouting:errors:OriginIsMissing',
        required: true
    },
    {
        key: 'destination',
        type: 'latLon',
        i18nLabel: 'transit:transitRouting:DestinationFieldMapping',
        i18nErrorLabel: 'transit:transitRouting:errors:DestinationIsMissing',
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
