/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import TraclusDLForm from './traclusDLForm';
import TraclusDLCalculationPanel from './traclusDLCalculationPanel';

import {
    TraclusDLInputParameters,
    TraclusDLCalculationResult,
    defaultParameters,
    defaultResult
} from 'transition-common/lib/services/traclusDL/type';

export type Calculation = {
    id: number;
    parameters: TraclusDLInputParameters;
    result: TraclusDLCalculationResult;
};

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = () => {
    const [calculations, setCalculations] = React.useState<Calculation[]>([]);
    const [modifiedCalculation, setModifiedCalculation] = React.useState<Calculation | undefined>(undefined);

    const nextId = React.useRef(0);

    const onNewModifiedCalculation = () => {
        const calculation: Calculation = {
            id: nextId.current,
            parameters: { ...defaultParameters },
            result: { ...defaultResult }
        };

        setModifiedCalculation(calculation);
    };

    const addCalculation = (calculation?: Calculation) => {
        if (calculation && !calculations.find((calc) => calc.id === calculation.id)) {
            setCalculations((prev) => [...prev, calculation]);
            nextId.current++;
        }
    };

    const updateParameters = (parameters: TraclusDLInputParameters) => {
        if (!modifiedCalculation) {
            return;
        }

        setCalculations((prev) =>
            prev.map((calc) =>
                calc.id === modifiedCalculation.id
                    ? { ...calc, parameters }
                    : calc
            )
        );
    };

    const onBackToForm = (parameters?: TraclusDLInputParameters) => {
        if (parameters) {
            addCalculation(modifiedCalculation);
            updateParameters(parameters);
        }

        setModifiedCalculation(undefined);
    };

    return (
        <div id="tr__traclus-dl-panel" className="tr__traclus-dl-panel tr__panel">
            <h3>
                <img src="/dist/images/icons/interface/traclus_dl_black.svg" className="_icon" alt="Traclus DL Panel" />{' '}
                Traclus DL Panel
            </h3>

            {/* Use the display style to keep the form state*/}
            <div style={{ display: modifiedCalculation ? 'none' : 'block' }}>
                <TraclusDLForm
                    calculations={calculations}
                    onNewCalculation={onNewModifiedCalculation}
                />
            </div>


            {modifiedCalculation && (
                <TraclusDLCalculationPanel
                    parameters={modifiedCalculation.parameters}
                    onBack={onBackToForm}
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
