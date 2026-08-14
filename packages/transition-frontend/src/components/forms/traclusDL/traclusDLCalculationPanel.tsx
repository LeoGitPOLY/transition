/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import React, { useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import Button from 'chaire-lib-frontend/lib/components/input/Button';
import InputWrapper from 'chaire-lib-frontend/lib/components/input/InputWrapper';
import InputStringFormatted from 'chaire-lib-frontend/lib/components/input/InputStringFormatted';
import { default as FormErrors } from 'chaire-lib-frontend/lib/components/pageParts/FormErrors';

import { TraclusDLOdDemandFromCsv } from 'transition-common/lib/services/traclusDL/TraclusDLOdDemandFromCsv';
import { defaultParameters, TraclusDLInputParameters } from 'transition-common/lib/services/traclusDL/type';

import { TraclusDLUtils } from '../../../services/traclusDL/TraclusDLUtils';
import { _toFloat } from 'chaire-lib-common/lib/utils/LodashExtensions';
import _toString from 'lodash/toString';
import GenericCsvImportAndMappingForm from '../csv/GenericCsvImportAndMappingForm';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import Collapsible from 'react-collapsible';

export interface TraclusDLCalculationPanelProps extends WithTranslation {
    jobId: number | null;
    demand: TraclusDLOdDemandFromCsv;
    onBack: (newJobId: number | null) => void;
}

type InvalidField = {
    invalid: boolean;
    error?: string;
};

type ParameterConfig = {
    min: number;
    max: number;
    label: string;
    maxLabel?: string;
};

// Parameter configuration: bounds and labels.
const PARAMETER_CONFIG: Record<keyof TraclusDLInputParameters, ParameterConfig> = {
    maxAngle: {
        min: 0,
        max: 22.5,
        label: 'Max angle'
    },
    segSize: {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        maxLabel: 'Any positive value',
        label: 'Seg size'
    },
    maxDistance: {
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
        maxLabel: 'Any positive value',
        label: 'Max distance'
    },
    minDensity: {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        maxLabel: 'Any positive value',
        label: 'Min density'
    }
};

const TraclusDLCalculationPanel: React.FunctionComponent<TraclusDLCalculationPanelProps> = (props) => {
    const [parameters, setParameters] = useState<TraclusDLInputParameters>(defaultParameters);
    const [invalidFields, setInvalidFields] = useState<Partial<Record<keyof TraclusDLInputParameters, InvalidField>>>(
        {}
    );
    const parameterErrors: string[] = Object.values(invalidFields)
        .filter((field) => field?.invalid && field.error)
        .map((field) => field!.error as string);

    const [calculationErrors, setCalculationErrors] = useState<string[]>([]);
    const hasInvalidFields = (): boolean => Object.values(invalidFields).some((field) => field?.invalid);

    const submitCalculation = async (): Promise<void> => {
        if (hasInvalidFields()) {
            return;
        }

        setCalculationErrors([]);

        try {
            const jobId = await TraclusDLUtils.runCalculation(props.demand, parameters);
            console.log('TraClus-DL calculation job created with ID:', jobId);

            props.onBack(jobId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setCalculationErrors([message]);
        }
    };

    const onNumericParameterChange = (
        field: keyof TraclusDLInputParameters,
        newValue: { value: number; valid?: boolean }
    ): void => {
        if (newValue.valid) {
            setParameters((prev) => ({
                ...prev,
                [field]: newValue.value
            }));

            // Remove the error associated with this field.
            setInvalidFields((prev) => ({
                ...prev,
                [field]: {
                    invalid: false
                }
            }));
            return;
        }

        // Replace the previous error for this field.
        const { min, max, label } = PARAMETER_CONFIG[field];
        const maxLabel = PARAMETER_CONFIG[field].maxLabel || max.toString();
        setInvalidFields((prev) => ({
            ...prev,
            [field]: {
                invalid: true,
                error: `${label} is not valid. Must be a number between ${min} and ${maxLabel}.`
            }
        }));
    };

    const numericField = (field: keyof TraclusDLInputParameters): React.ReactNode => {
        const { min, max, label } = PARAMETER_CONFIG[field];

        return (
            <InputWrapper key={field} label={label}>
                <InputStringFormatted
                    id={`formFieldTraclusDL${field.charAt(0).toUpperCase()}${field.slice(1)}`}
                    value={parameters[field]}
                    stringToValue={_toFloat}
                    valueToString={_toString}
                    onValueUpdated={(newValue) => onNumericParameterChange(field, newValue)}
                    min={min}
                    max={max}
                    type="number"
                />
            </InputWrapper>
        );
    };

    return (
        <div className="tr__traclus-dl-parameters-panel">
            <Collapsible trigger={'Imported Input File'} open={true} transitionTime={100}>
                <fieldset disabled={true}>
                    <GenericCsvImportAndMappingForm
                        csvFieldMapper={props.demand}
                        // Empty function: only display the csv import and mapping form, no need to handle updates
                        // eslint-disable-next-line no-empty-function
                        onUpdate={() => { }}
                        importFileName={TraclusDLConstants.CSV_FILE_NAME}
                    />
                </fieldset>
            </Collapsible>
            <Collapsible trigger={'Parameters Configuration'} open={true} transitionTime={100}>
                {(Object.keys(PARAMETER_CONFIG) as (keyof TraclusDLInputParameters)[]).map(numericField)}

                <FormErrors errors={parameterErrors} />

                <div className="tr__form-buttons-container">
                    <Button label="Cancel" color="red" onClick={() => props.onBack(null)} />
                    <Button
                        label="RUN"
                        color="green"
                        disabled={hasInvalidFields()}
                        onClick={() => submitCalculation()}
                    />
                </div>
                <FormErrors errors={calculationErrors} />
            </Collapsible>
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLCalculationPanel);
