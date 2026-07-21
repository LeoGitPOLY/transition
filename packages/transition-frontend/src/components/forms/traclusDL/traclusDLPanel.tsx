/*
 * Copyright 2023, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import TraclusDLOdDemandFromCsv from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';
import GenericCsvImportAndMappingForm from '../csv/GenericCsvImportAndMappingForm';

// export interface TraclusDLPanelProps {}

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = (props) => {
    const [nextEnabled, setNextEnabled] = React.useState(false);
    const [demand, setDemand] = React.useState<TraclusDLOdDemandFromCsv>(new TraclusDLOdDemandFromCsv());

    React.useEffect(() => {
        console.log('TraclusDLPanel mounted');

        return () => {
            console.log('TraclusDLPanel unmounted');
        };
    }, []);

    const onDemandStepComplete = (demand: TraclusDLOdDemandFromCsv, isReadyAndValid: boolean) => {
        setDemand(demand);

        // CSV mapping is valid and the file has been uploaded
        setNextEnabled(demand.isValid() && isReadyAndValid);
    };

    return (
        <div id="tr__traclus-dl-panel" className="tr__traclus-dl-panel tr__panel">
            <h2>Traclus DL Panel</h2>

            <React.Fragment>
                <h4>{props.t('transit:batchCalculation:ConfigureDemand')}</h4>

                <GenericCsvImportAndMappingForm
                    csvFieldMapper={demand}
                    onUpdate={onDemandStepComplete}
                    importFileName="traclusDL.csv"
                />
            </React.Fragment>
            <p>CSV ready: {nextEnabled ? 'Yes' : 'No'}</p>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
