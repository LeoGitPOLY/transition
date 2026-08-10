/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import TraclusDLForm, { TraclusDLFormHandle } from './traclusDLForm';
import TraclusDParametersPanel from './traclusDLParametersPanel';

import { TraclusDLInputParameters } from 'transition-common/lib/services/traclusDL/type';

export type Calculation = {
    calculationId: string;
    jobId: number | null;
    parameters: TraclusDLInputParameters;
};

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = () => {
    const formRef = React.useRef<TraclusDLFormHandle>(null);

    const [modifiedCalculation, setModifiedCalculation] = React.useState<Calculation | undefined>(undefined);

    const onOpenParameters = (calculation: Calculation) => {
        setModifiedCalculation(calculation);
    };

    const onBackFromParametersPanel = async (parameters?: TraclusDLInputParameters) => {
        if (!parameters || !modifiedCalculation) {
            setModifiedCalculation(undefined);
            return;
        }

        await formRef.current?.submitCalculation(modifiedCalculation, parameters);
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
                <TraclusDLForm formRef={formRef} onOpenParameters={onOpenParameters} />
            </div>

            {modifiedCalculation && (
                <React.Fragment>
                    <TraclusDParametersPanel
                        parameters={modifiedCalculation.parameters}
                        onBack={onBackFromParametersPanel}
                    />
                </React.Fragment>
            )}
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
