/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import Button from 'chaire-lib-frontend/lib/components/input/Button';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { TraclusDLInputParameters } from 'transition-common/lib/services/traclusDL/type';

export interface TraclusDLCalculationPanelProps extends WithTranslation {
    parameters: TraclusDLInputParameters;
    onBack: (parameters?: TraclusDLInputParameters) => void;
}

const TraclusDParametersPanel: React.FunctionComponent<TraclusDLCalculationPanelProps> = (props) => {
    const [parameters, setParameters] = React.useState<TraclusDLInputParameters>(props.parameters);

    // TODO (LEO) : change when a form library is used to handle the input changes and validation
    const onFieldChange = (field: keyof TraclusDLInputParameters) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value: number | boolean;

        if (field === 'isParallel') {
            value = event.target.checked;
        } else {
            value = Number(event.target.value);
        }

        setParameters({
            ...parameters,
            [field]: value
        });
    };

    // TODO (LEO) : add a form library to handle the input changes and validation
    // <InputWrapper <InputStringFormatted>
    return (
        <div className="tr__traclus-dl-parameters-panel">
            <label>
                Max angle
                <input type="number" value={parameters.maxAngle} onChange={onFieldChange('maxAngle')} />
            </label>

            <label>
                Seg size
                <input type="number" value={parameters.segSize} onChange={onFieldChange('segSize')} />
            </label>

            <label>
                Max distance
                <input type="number" value={parameters.maxDistance} onChange={onFieldChange('maxDistance')} />
            </label>

            <label>
                Min density
                <input type="number" value={parameters.minDensity} onChange={onFieldChange('minDensity')} />
            </label>

            <label>
                Parallel computation
                <input type="checkbox" checked={parameters.isParallel} onChange={onFieldChange('isParallel')} />
            </label>

            <div className="tr__form-buttons-container">
                <Button label="Cancel" color="red" onClick={() => props.onBack(undefined)} />
                <Button label="RUN" color="green" onClick={() => props.onBack(parameters)} />
            </div>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDParametersPanel);
