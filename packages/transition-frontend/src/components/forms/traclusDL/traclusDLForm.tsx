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
import { MappingTraclusDLOdDemandFromCsvAttributes } from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import FormErrors from 'chaire-lib-frontend/lib/components/pageParts/FormErrors';
import EventManager from 'chaire-lib-common/lib/services/events/EventManager';
import { MapUpdateLayerEventType } from 'chaire-lib-frontend/lib/services/map/events/MapEventsCallbacks';
import serviceLocator from 'chaire-lib-common/lib/utils/ServiceLocator';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import { o } from 'react-router/dist/development/index-react-server-client-BS5F89FR';

export interface TraclusDLFormProps extends WithTranslation {
    calculations: Calculation[];
    demand: TraclusDLOdDemandFromCsv;
    setDemand: (demand: TraclusDLOdDemandFromCsv) => void;
    onNewCalculation: () => void;
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
    const [importErrors, setImportErrors] = React.useState<string[]>([]);
    const [isImportDone, setImportDone] = React.useState(false);

    const onDemandStepComplete = (updatedDemand: TraclusDLOdDemandFromCsv, isReadyAndValid: boolean) => {
        const isValid = updatedDemand.isValid() && isReadyAndValid;

        props.setDemand(updatedDemand);
        setImportDone(isValid);
        setImportErrors([]);

        if (isValid) {
            getGeoJsonFromCsvFile(updatedDemand);
        }
    };

    const onChangeInputFile = () => {
        props.setDemand(new TraclusDLOdDemandFromCsv());
        setImportDone(false);
    };

    const getGeoJsonFromCsvFile = async (demand: TraclusDLOdDemandFromCsv) => {
        await TraclusDLUtils.getGeoJsonFromCsvFile(demand)
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

    // TODO (LEO) : props.t('Something')
    return (
        <div id="tr__traclus-dl-form" className="tr__traclus-dl-form">
            <Collapsible trigger={'Input File Import'} open={true} transitionTime={100}>
                <h4>{'Importation du fichier OD en entrée pour l\'outil Traclus DL.'}</h4>
                <fieldset disabled={isImportDone}>
                    <GenericCsvImportAndMappingForm
                        csvFieldMapper={props.demand}
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
                {isImportDone && (
                    <React.Fragment>
                        <div className="tr__form-buttons-container">
                            <Button label="+ Nouvelle Calculation" color="blue" onClick={props.onNewCalculation} />
                        </div>
                        <ExecutableJobComponent customActions={[]} defaultPageSize={10} jobType="traclusDL" />
                    </React.Fragment>
                )}
            </Collapsible>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLForm);
