
import React, { useState } from 'react';
import AnthropometryForm from './AnthropometryForm';

const AnalysisSelector: React.FC = () => {
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');

    const handleAnalysisChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const analysisType = event.target.value;
        setSelectedAnalysis(analysisType);
    };

    return (
        <div>
            <h2>Выберите анализ</h2>
            <select value={selectedAnalysis} onChange={handleAnalysisChange}>
                <option value="">-- Выберите анализ --</option>
                <option value="anthropometry">Антропометрия</option>
            </select>

            {selectedAnalysis === 'anthropometry' && <AnthropometryForm />}

        </div>
    );
};

export default AnalysisSelector;