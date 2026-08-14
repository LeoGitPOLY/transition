/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import TraclusDLForm, { TraclusDLFormHandle } from './traclusDLForm';
import TraclusDLCalculationPanel from './traclusDLCalculationPanel';
import { TraclusDLOdDemandFromCsv } from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = () => {
    const formRef = React.useRef<TraclusDLFormHandle>(null);

    const [calculationJobId, setCalculationJobId] = React.useState<number | null | undefined>(undefined);
    const [calculationDemand, setCalculationDemand] = React.useState<TraclusDLOdDemandFromCsv | undefined>(undefined);

    const isCalculationOpen = calculationJobId !== undefined && calculationDemand !== undefined;

    const onOpenCalculation = (jobId: number | null, demand: TraclusDLOdDemandFromCsv) => {
        setCalculationJobId(jobId);
        setCalculationDemand(demand);
    };

    const onBackFromParametersPanel = async (newJobId: number | null) => {
        setCalculationJobId(undefined);
        setCalculationDemand(undefined);

        if (newJobId) {
            await formRef.current?.newCalculation(newJobId);
        }
    };

    return (
        <div id="tr__traclus-dl-panel" className="tr__traclus-dl-panel tr__panel">
            <h3>
                <img src="/dist/images/icons/interface/traclus_dl_black.svg" className="_icon" alt="Traclus DL Panel" />{' '}
                Traclus DL Panel
            </h3>

            {/* Use the display style to keep the form state active */}
            <div style={{ display: isCalculationOpen ? 'none' : 'block' }}>
                <TraclusDLForm formRef={formRef} onOpenCalculation={onOpenCalculation} />
            </div>
            {isCalculationOpen && (
                <React.Fragment>
                    <TraclusDLCalculationPanel
                        jobId={calculationJobId}
                        demand={calculationDemand}
                        onBack={onBackFromParametersPanel}
                    />
                </React.Fragment>
            )}
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
