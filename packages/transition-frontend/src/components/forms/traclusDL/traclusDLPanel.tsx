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
import TraclusDLCalculationPanel from './traclusDLCalculationPanel';
import { TraclusDLInputParameters, TraclusDLCalculationResult } from 'transition-common/lib/services/traclusDL/type';

type Calculation = {
    id: number;
    parameters: TraclusDLInputParameters;
    result: TraclusDLCalculationResult;
};

const defaultParameters: TraclusDLInputParameters = {
    maxAngle: 5,
    minDensity: 250,
    maxDistance: 500,
    segSize: 100,
    isParallel: true
};

const defaultResult: TraclusDLCalculationResult = {
    completed: false,
    percentComplete: 0,
    consoleOutput: ''
};

const TraclusDLPanel: React.FunctionComponent<WithTranslation> = (props) => {
    const [nextEnabled, setNextEnabled] = React.useState(false);
    const [demand, setDemand] = React.useState<TraclusDLOdDemandFromCsv>(new TraclusDLOdDemandFromCsv());
    const [isFileConfirmed, setIsFileConfirmed] = React.useState(false);
    const [calculations, setCalculations] = React.useState<Calculation[]>([]);
    const [selectedId, setSelectedId] = React.useState<number | undefined>(undefined);
    const nextIdRef = React.useRef(1);

    const onDemandStepComplete = (demand: TraclusDLOdDemandFromCsv, isReadyAndValid: boolean) => {
        setDemand(demand);
        setNextEnabled(demand.isValid() && isReadyAndValid);
    };

    // TODO (LEO) : replace with the actual file name/line count once available on TraclusDLOdDemandFromCsv
    const csvFileName = 'traclusDL.csv';
    const csvLineCount = 0;

    const onChangeInputFile = () => {
        setIsFileConfirmed(false);
        setCalculations([]);
        setSelectedId(undefined);
    };

    const onNewCalculation = () => {
        const id = nextIdRef.current++;
        const newCalculation: Calculation = {
            id,
            parameters: { ...defaultParameters },
            result: { ...defaultResult }
        };
        setCalculations([...calculations, newCalculation]);
        setSelectedId(id);
    };

    const onUpdateParameters = (id: number, parameters: TraclusDLInputParameters) => {
        setCalculations(calculations.map((calc) => (calc.id === id ? { ...calc, parameters } : calc)));
    };

    const onCalculate = (id: number) => {
        // TODO (LEO) : call TraclusDLRunner instead of printing
        console.log('Running calculation', id, calculations.find((calc) => calc.id === id)?.parameters);
    };

    return (
        <div id="tr__traclus-dl-panel" className="tr__traclus-dl-panel tr__panel">
            <h2>Traclus DL Panel</h2>
            {!isFileConfirmed && (
                <React.Fragment>
                    <h4>{props.t('transit:batchCalculation:ConfigureDemand')}</h4>
                    <GenericCsvImportAndMappingForm
                        csvFieldMapper={demand}
                        onUpdate={onDemandStepComplete}
                        importFileName="traclusDL.csv"
                    />
                    <button disabled={!nextEnabled} onClick={() => setIsFileConfirmed(true)}>
                        Next
                    </button>
                </React.Fragment>
            )}
            {isFileConfirmed && (
                <React.Fragment>
                    <div className="tr__traclus-dl-header">
                        <span>
                            {csvFileName} ({csvLineCount} lines)
                        </span>
                        <button onClick={onChangeInputFile}>Change input file</button>
                    </div>
                    {calculations.map((calc) => (
                        <TraclusDLCalculationPanel
                            key={calc.id}
                            parameters={calc.parameters}
                            result={calc.result}
                            isSelected={calc.id === selectedId}
                            onSelect={() => setSelectedId(calc.id)}
                            onUpdateParameters={(parameters) => onUpdateParameters(calc.id, parameters)}
                            onCalculate={() => onCalculate(calc.id)}
                        />
                    ))}
                    <button onClick={onNewCalculation}>+ Nouveau</button>
                </React.Fragment>
            )}
        </div>
    );
};

export default withTranslation(['transit', 'main'])(TraclusDLPanel);
