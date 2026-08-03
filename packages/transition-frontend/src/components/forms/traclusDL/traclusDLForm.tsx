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
import { defaultParameters, TraclusDLInputParameters } from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';

export interface TraclusDLFormProps extends WithTranslation {
    calculations: Calculation[];

    onNewCalculation: () => void;
}

const TraclusDLForm: React.FunctionComponent<TraclusDLFormProps> = (props) => {
    const [demand, setDemand] = React.useState<TraclusDLOdDemandFromCsv>(new TraclusDLOdDemandFromCsv());
    const [isImportDone, setImportDone] = React.useState(false);

    const onDemandStepComplete = (updatedDemand: TraclusDLOdDemandFromCsv, isReadyAndValid: boolean) => {
        setDemand(updatedDemand);
        setImportDone(updatedDemand.isValid() && isReadyAndValid);
    };

    const onChangeInputFile = () => {
        setDemand(new TraclusDLOdDemandFromCsv());
        setImportDone(false);
    };

    const onStartCalculation = async () => {
        const parameters: TraclusDLInputParameters = defaultParameters;
        const result = await TraclusDLUtils.runCalculation(demand, parameters);
        console.log(`Calculation completed: ${result.completed} + ${result.consoleOutput}`);
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
                        importFileName="traclusDL.csv"
                    />
                </fieldset>

                {isImportDone && (
                    <div className="tr__form-buttons-container">
                        <Button label="Change input file" color="red" onClick={onChangeInputFile} />
                    </div>
                )}
            </Collapsible>

            <Collapsible trigger={'Traclus DL Calculations'} open={true} transitionTime={100}>
                {isImportDone && (
                    <React.Fragment>
                        <h4>TABLE OF ALL CALCULATIONS</h4>
                        <h4>{props.calculations.length} calculations</h4>
                        <ExecutableJobComponent
                            customActions={[]}
                            defaultPageSize={10}
                            jobType="traclusDL"
                        />
                        <div className="tr__form-buttons-container">
                            <Button label="+ Nouveau" color="blue" onClick={props.onNewCalculation} />
                            <Button label="RUN" color="green" onClick={() => onStartCalculation()} />
                        </div>
                    </React.Fragment>
                )}
            </Collapsible>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLForm);
