/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import TraclusDLForm from './traclusDLForm';
import TraclusDParametersPanel from './traclusDLParametersPanel';

import {
    TraclusDLInputParameters,
    TraclusDLCalculationResult,
    defaultParameters,
    defaultResult
} from 'transition-common/lib/services/traclusDL/type';
import { TraclusDLOdDemandFromCsv } from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import FormErrors from 'chaire-lib-frontend/lib/components/pageParts/FormErrors';
import { v4 as uuidv4 } from 'uuid';

export type Calculation = {
    calculationId: string;
    jobId: number | null;
    parameters: TraclusDLInputParameters;
    result: TraclusDLCalculationResult | null;
};

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = () => {
    const [demand, setDemand] = React.useState<TraclusDLOdDemandFromCsv>(new TraclusDLOdDemandFromCsv());

    const [calculations, setCalculations] = React.useState<Calculation[]>([]);
    const [modifiedCalculation, setModifiedCalculation] = React.useState<Calculation | undefined>(undefined);

    const [calculationErrors, setCalculationErrors] = React.useState<string[]>([]);

    const onNewModifiedCalculation = () => {
        const calculation: Calculation = {
            calculationId: uuidv4(),
            jobId: null,
            parameters: { ...defaultParameters },
            result: null
        };

        setModifiedCalculation(calculation);
        setCalculationErrors([]);
    };

    const updateCalculation = (jobId: number, parameters: TraclusDLInputParameters) => {
        if (!modifiedCalculation) {
            return;
        }

        setCalculations((prev) => {
            const index = prev.findIndex((calc) => calc.calculationId === modifiedCalculation.calculationId);

            const updatedCalculation: Calculation = {
                ...modifiedCalculation,
                jobId,
                parameters,
                result: null
            };

            // TODO (LEO) : stop the job on server + other cleanup (?)
            // Update existing calculation
            if (index !== -1) {
                const calculations = [...prev];
                calculations[index] = updatedCalculation;
                return calculations;
            }

            // Add new calculation
            return [...prev, updatedCalculation];
        });
    };

    const onBackFromParametersPanel = async (parameters?: TraclusDLInputParameters) => {
        if (!parameters || !modifiedCalculation) {
            setModifiedCalculation(undefined);
            return;
        }

        await TraclusDLUtils.runCalculation(demand, parameters)
            .then((jobId) => {
                console.log('TraClus-DL calculation job created with ID:', jobId);
                updateCalculation(jobId, parameters);
            })
            .catch((error) => {
                setCalculationErrors([error.message]);
            });

        setModifiedCalculation(undefined);
    };

    return (
        <div id="tr__traclus-dl-panel" className="tr__traclus-dl-panel tr__panel">
            <h3>
                <img src="/dist/images/icons/interface/traclus_dl_black.svg" className="_icon" alt="Traclus DL Panel" />{' '}
                Traclus DL Panel
            </h3>

            {/* Use the display style to keep the form state active */}
            <div style={{ display: modifiedCalculation ? 'none' : 'block' }}>
                <TraclusDLForm
                    calculations={calculations}
                    demand={demand}
                    setDemand={setDemand}
                    onNewCalculation={onNewModifiedCalculation}
                />
                <FormErrors errors={calculationErrors} />
            </div>

            {modifiedCalculation && (
                <TraclusDParametersPanel
                    parameters={modifiedCalculation.parameters}
                    onBack={onBackFromParametersPanel}
                />
            )}

            {/* TODO (LEO) : the selected calculation outputs */}
            {/* <div className="tr__traclus-dl-outputs">
                <label>Outputs</label>

                <textarea readOnly value={props.result.consoleOutput} />
            </div> */}
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
