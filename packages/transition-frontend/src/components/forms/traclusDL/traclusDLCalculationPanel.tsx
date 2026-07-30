/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TraclusDLInputParameters, TraclusDLCalculationResult } from 'transition-common/lib/services/traclusDL/type';

export interface TraclusDLCalculationPanelProps extends WithTranslation {
    parameters: TraclusDLInputParameters;
    result: TraclusDLCalculationResult;
    isSelected: boolean;
    onSelect: () => void;
    onUpdateParameters: (parameters: TraclusDLInputParameters) => void;
    onCalculate: () => void;
}

const TraclusDLCalculationPanel: React.FunctionComponent<TraclusDLCalculationPanelProps> = (props) => {
    const onFieldChange =
        (field: keyof TraclusDLInputParameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = field === 'isParallel' ? e.target.checked : Number(e.target.value);
            props.onUpdateParameters({ ...props.parameters, [field]: value });
        };

    // Collapsed summary card: click anywhere to select it
    if (!props.isSelected) {
        return (
            <div
                className="tr__traclus-dl-calculation-panel tr__traclus-dl-calculation-panel--unselected"
                onClick={props.onSelect}
            >
                <span className="tr__traclus-dl-result">R {props.result.percentComplete}%</span>
                <span>Max Angle: {props.parameters.maxAngle}</span>
                <span>Min Density: {props.parameters.minDensity}</span>
                <span>Seg Size: {props.parameters.segSize}</span>
                <span>Max Distance: {props.parameters.maxDistance}</span>
            </div>
        );
    }

    // Expanded card: editable parameters + outputs + actions
    return (
        <div className="tr__traclus-dl-calculation-panel tr__traclus-dl-calculation-panel--selected">
            <span className="tr__traclus-dl-result">R {props.result.percentComplete}%</span>
            <div className="tr__traclus-dl-parameters">
                <label>
                    Max angle
                    <input type="number" value={props.parameters.maxAngle} onChange={onFieldChange('maxAngle')} />
                </label>
                <label>
                    Seg size
                    <input type="number" value={props.parameters.segSize} onChange={onFieldChange('segSize')} />
                </label>
                <label>
                    Max distance
                    <input type="number" value={props.parameters.maxDistance} onChange={onFieldChange('maxDistance')} />
                </label>
                <label>
                    Min density
                    <input type="number" value={props.parameters.minDensity} onChange={onFieldChange('minDensity')} />
                </label>
                <label>
                    Parallel computation
                    <input
                        type="checkbox"
                        checked={props.parameters.isParallel}
                        onChange={onFieldChange('isParallel')}
                    />
                </label>
            </div>
            <div className="tr__traclus-dl-outputs">
                <label>Outputs</label>
                <textarea readOnly value={props.result.consoleOutput} />
            </div>
            <div className="tr__form-buttons-container">
                <button onClick={props.onCalculate}>Calculé</button>
                <button>↓</button>
            </div>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLCalculationPanel);
