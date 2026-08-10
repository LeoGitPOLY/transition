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
import { Calculation } from './traclusDLPanel';
import Collapsible from 'react-collapsible';
import ExecutableJobComponent from '../../parts/executableJob/ExecutableJobComponent';
import {
    TraclusDLInputParameters,
    MappingTraclusDLOdDemandFromCsvAttributes,
    defaultParameters,
    TraclusDLCalculationResult
} from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import FormErrors from 'chaire-lib-frontend/lib/components/pageParts/FormErrors';
import EventManager from 'chaire-lib-common/lib/services/events/EventManager';
import { MapUpdateLayerEventType } from 'chaire-lib-frontend/lib/services/map/events/MapEventsCallbacks';
import serviceLocator from 'chaire-lib-common/lib/utils/ServiceLocator';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { v4 as uuidv4 } from 'uuid';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

// Imperative handle exposed to TraclusDLPanel
export interface TraclusDLFormHandle {
    submitCalculation: (calculation: Calculation, parameters: TraclusDLInputParameters) => Promise<void>;
}

export interface TraclusDLFormProps extends WithTranslation {
    formRef: React.Ref<TraclusDLFormHandle>;
    onOpenParameters: (calculation: Calculation) => void;
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

    const [calculations, setCalculations] = React.useState<Calculation[]>([]);
    const [calculationErrors, setCalculationErrors] = React.useState<string[]>([]);

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

    const getGeoJsonFromCsvFile = async (demandToConvert: TraclusDLOdDemandFromCsv) => {
        await TraclusDLUtils.getGeoJsonFromCsvFile(demandToConvert)
            .then((odLines) => {
                (serviceLocator.eventManager as EventManager).emitEvent<MapUpdateLayerEventType>('map.updateLayer', {
                    layerName: 'traclusDlInputOdLines',
                    data: odLines
                });
            })
            .catch((error) => {
                onChangeInputFile();
                setImportErrors([error.message]);
            });
    };

    const onNewCalculation = () => {
        const calculation: Calculation = {
            calculationId: uuidv4(),
            jobId: null,
            parameters: { ...defaultParameters }
        };

        props.onOpenParameters(calculation);
    };

    const submitCalculation = async (calculation: Calculation, parameters: TraclusDLInputParameters): Promise<void> => {
        setCalculationErrors([]);

        try {
            const jobId = await TraclusDLUtils.runCalculation(demand, parameters);
            console.log('TraClus-DL calculation job created with ID:', jobId);

            setCalculations((prev) => {
                const index = prev.findIndex((calc) => calc.calculationId === calculation.calculationId);

                const updatedCalculation: Calculation = {
                    ...calculation,
                    jobId,
                    parameters
                };

                // TODO (LEO) : stop the job on server + other cleanup (?)
                if (index !== -1) {
                    const next = [...prev];
                    next[index] = updatedCalculation;
                    return next;
                }

                return [...prev, updatedCalculation];
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setCalculationErrors([message]);
        }
    };
    React.useImperativeHandle(props.formRef, () => ({ submitCalculation }), [demand]);

    // ExecutableJobComponent custom action callback:
    const onSelectCalculationResults = async (jobId: number) => {
        await TraclusDLUtils.getCalculationResultsByJobId(jobId).
            then((results) => {
                // TODO (LEO) : better way to handle empty GeoJSON
                const corridorGeoJson = results.corridorGeoJson ? results.corridorGeoJson : {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'MultiLineString',
                                coordinates: [[]]
                            }
                        }
                    ]
                } as GeoJSON.FeatureCollection<GeoJSON.MultiLineString>;

                (serviceLocator.eventManager as EventManager).emitEvent<MapUpdateLayerEventType>('map.updateLayer', {
                    layerName: 'traclusDlCorridorsOutput',
                    data: corridorGeoJson
                });
                setSelectedResults(results);
                setSelectedResultsErrors([]);
            }).catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                setSelectedResultsErrors([message]);
            });
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

            <Collapsible trigger={'Traclus DL Calculations'} open={isImportDone} transitionTime={100}>
                {isImportDone && (
                    <React.Fragment>
                        <div className="tr__form-buttons-container">
                            <Button label="+ Nouvelle Calculation" color="blue" onClick={onNewCalculation} />
                        </div>
                        <FormErrors errors={calculationErrors} />
                        <ExecutableJobComponent
                            customActions={[
                                { title: 'Select', callback: onSelectCalculationResults, icon: faEye },
                                { title: 'Edit', callback: onSelectCalculationResults, icon: faPencilAlt }
                            ]}
                            defaultPageSize={10}
                            jobType="traclusDL"
                        />
                    </React.Fragment>
                )}
            </Collapsible>
            <Collapsible trigger={'Selected Results Information'} open={selectedResults !== null} transitionTime={100}>
                {selectedResults && selectedResultsErrors.length === 0 && (
                    <React.Fragment>
                        <h4>{'Selected Results Information'}</h4>
                        <h4>{`Console Output: ${selectedResults.consoleOutput}`}</h4>
                        <h4>{`Corridor GeoJSON: ${JSON.stringify(selectedResults.corridorGeoJson)}`}</h4>
                    </React.Fragment>
                )}
                {selectedResultsErrors.length > 0 && (
                    <FormErrors errors={selectedResultsErrors} />
                )}
            </Collapsible>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLForm);
