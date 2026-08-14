/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import TraclusDLOdDemandFromCsv from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';
import GenericCsvImportAndMappingForm from '../csv/GenericCsvImportAndMappingForm';
import Button from 'chaire-lib-frontend/lib/components/input/Button';
import Collapsible from 'react-collapsible';
import ExecutableJobComponent from '../../parts/executableJob/ExecutableJobComponent';
import {
    MappingTraclusDLOdDemandFromCsvAttributes,
    TraclusDLCalculationResult
} from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import FormErrors from 'chaire-lib-frontend/lib/components/pageParts/FormErrors';
import EventManager from 'chaire-lib-common/lib/services/events/EventManager';
import { MapUpdateLayerEventType } from 'chaire-lib-frontend/lib/services/map/events/MapEventsCallbacks';
import serviceLocator from 'chaire-lib-common/lib/utils/ServiceLocator';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

// Imperative handle exposed to TraclusDLPanel
export interface TraclusDLFormHandle {
    newCalculation: (jobId: number | null) => Promise<void>;
}

export interface TraclusDLFormProps extends WithTranslation {
    formRef: React.Ref<TraclusDLFormHandle>;
    onOpenCalculation: (jobId: number | null, demand: TraclusDLOdDemandFromCsv) => void;
}

const mockMapping: MappingTraclusDLOdDemandFromCsvAttributes = {
    type: 'csv',
    csvFields: ['name', 'weight', 'x_start', 'y_start', 'x_end', 'y_end'],
    fileAndMapping: {
        csvFile: {
            location: 'upload',
            filename: 'in_order_header_name.txt',
            uploadFilename: 'traclusDL.csv'
        },
        fieldMappings: {
            projection: '2950',
            id: 'name',
            weight: 'weight',
            originLat: 'y_start',
            originLon: 'x_start',
            destinationLat: 'y_end',
            destinationLon: 'x_end'
        }
    }
};

const TraclusDLForm: React.FunctionComponent<TraclusDLFormProps> = (props) => {
    const [demand, setDemand] = React.useState<TraclusDLOdDemandFromCsv>(new TraclusDLOdDemandFromCsv());
    const [importErrors, setImportErrors] = React.useState<string[]>([]);
    const [isImportDone, setImportDone] = React.useState(false);

    // const selectedJobId = useRef<number | null>(null);

    const [selectedResults, setSelectedResults] = React.useState<TraclusDLCalculationResult | null>(null);
    const [selectedResultsErrors, setSelectedResultsErrors] = React.useState<string[]>([]);

    const onDemandStepComplete = (updatedDemand: TraclusDLOdDemandFromCsv, isReadyAndValid: boolean) => {
        const isValid = updatedDemand.isValid() && isReadyAndValid;

        setDemand(updatedDemand);
        setImportDone(isValid);
        setImportErrors([]);

        if (isValid) {
            getGeoJsonFromCsvFile(updatedDemand);
        }
    };

    const onChangeInputFile = () => {
        setDemand(new TraclusDLOdDemandFromCsv());
        setImportDone(false);
        setSelectedResults(null);
    };
    const updateMapLayers = (corridorGeoJson?: GeoJSON.FeatureCollection, inputGeoJson?: GeoJSON.FeatureCollection) => {
        const corridorLayer = corridorGeoJson ? corridorGeoJson : ({} as GeoJSON.FeatureCollection);
        (serviceLocator.eventManager as EventManager).emitEvent<MapUpdateLayerEventType>('map.updateLayer', {
            layerName: 'traclusDLOutputCorridors',
            data: corridorLayer
        });

        const inputLayer = inputGeoJson ? inputGeoJson : ({} as GeoJSON.FeatureCollection);
        (serviceLocator.eventManager as EventManager).emitEvent<MapUpdateLayerEventType>('map.updateLayer', {
            layerName: 'traclusDLInputOdLines',
            data: inputLayer
        });

    };
    const getGeoJsonFromCsvFile = async (demandToConvert: TraclusDLOdDemandFromCsv) => {
        updateMapLayers(undefined, undefined);
        await TraclusDLUtils.getGeoJsonFromCsvFile(demandToConvert)
            .then((odLines) => {
                updateMapLayers(undefined, odLines);
            })
            .catch((error) => {
                onChangeInputFile();
                setImportErrors([error.message]);
            });
    };

    const newCalculation = async (jobId: number | null): Promise<void> => {
        // TODO (LEO): something with the jobId back: subscribe to the job progress
        console.log('New calculation job created with ID:', jobId);
    };
    React.useImperativeHandle(props.formRef, () => ({ newCalculation }), []);

    // ExecutableJobComponent custom action callback: onSelectCalculationResults
    const onSelectCalculationResults = async (jobId: number) => {
        await TraclusDLUtils.getCalculationResultsByJobId(jobId)
            .then((results) => {
                updateMapLayers(results.corridorGeoJson, results.inputGeoJson);
                setSelectedResults(results);
                setSelectedResultsErrors([]);
            })
            .catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                setSelectedResultsErrors([message]);
            });
    };

    // ExecutableJobComponent custom action callback: onEditCalculation
    const onEditCalculation = async (jobId: number) => {
        props.onOpenCalculation(jobId, demand);
    };

    // TODO (LEO) : props.t('Something')
    return (
        <div id="tr__traclus-dl-form" className="tr__traclus-dl-form">
            <Collapsible trigger={'Input File Import'} open={true} transitionTime={100}>
                <h4>{'Importation du fichier OD en entrée pour l\'outil Traclus DL.'}</h4>
                <fieldset disabled={isImportDone}>
                    <GenericCsvImportAndMappingForm
                        csvFieldMapper={demand}
                        onUpdate={onDemandStepComplete}
                        importFileName={TraclusDLConstants.CSV_FILE_NAME}
                    />
                </fieldset>
                <FormErrors errors={importErrors} />
                {isImportDone && (
                    <div className="tr__form-buttons-container">
                        <Button label="Change input file" color="red" onClick={onChangeInputFile} />
                    </div>
                )}
                {/** TODO (LEO) : REMOVE*/}
                <div className="tr__form-buttons-container">
                    <Button
                        label="Get GeoJSON"
                        color="green"
                        onClick={() => {
                            const mockDemand: TraclusDLOdDemandFromCsv = new TraclusDLOdDemandFromCsv(mockMapping);
                            onDemandStepComplete(mockDemand, true);
                        }}
                    />
                </div>
            </Collapsible>

            <Collapsible trigger={'Traclus DL Calculations'} open={true} transitionTime={100}>
                <div className="tr__form-buttons-container">
                    <Button
                        label="+ Nouveau Calcul"
                        disabled={!isImportDone}
                        color="blue"
                        onClick={() => props.onOpenCalculation(null, demand)}
                    />
                </div>
                <ExecutableJobComponent
                    customActions={[
                        { title: 'Select', callback: onSelectCalculationResults, icon: faEye },
                        { title: 'Edit', callback: onEditCalculation, icon: faPencilAlt }
                    ]}
                    defaultPageSize={5}
                    jobType="traclusDL"
                />
            </Collapsible>
            <Collapsible trigger={'Selected Results Information'} open={selectedResults !== null} transitionTime={100}>
                {selectedResults && selectedResultsErrors.length === 0 && (
                    <React.Fragment>
                        <h4>{'Selected Results Information'}</h4>
                        <h4>{`Console Output: ${selectedResults.consoleOutput}`}</h4>
                    </React.Fragment>
                )}
                {selectedResultsErrors.length > 0 && <FormErrors errors={selectedResultsErrors} />}
            </Collapsible>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLForm);
