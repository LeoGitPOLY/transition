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
import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import { TraclusDLInputParameters } from 'transition-common/lib/services/traclusDL/type';

// export interface TraclusDLPanelProps {}

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = (props) => {
    const [next, setNextEnabled] = React.useState(false);
    const [result, setResult] = React.useState<string | null>(null);
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

    const onStartCalculation = async () => {
        const parameters: TraclusDLInputParameters = { minDensity: 100 };
        const result = await TraclusDLUtils.runCalculation(demand, parameters);
        setResult(`Calculation completed: ${result.completed} + ${result.textTest}`);
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
            {true && <button onClick={onStartCalculation}> Run TraClus_DL </button>}
            {result && <p>{result}</p>}
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
