import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NormalizationViz = () => {
    const [showBatchNorm, setShowBatchNorm] = useState(true);
    const [showNormalized, setShowNormalized] = useState(false);

    const originalData = [
        [1, 2, 3, 4],
        [2, 4, 6, 8],
        [3, 6, 9, 12]
    ];

    const batchNormData = [
        [-1.00, -1.00, -1.00, -1.00],
        [0.00, 0.00, 0.00, 0.00],
        [1.00, 1.00, 1.00, 1.00]
    ];

    const layerNormData = [
        [-1.34, -0.45, 0.45, 1.34],
        [-1.34, -0.45, 0.45, 1.34],
        [-1.34, -0.45, 0.45, 1.34]
    ];

    const currentData = showNormalized
        ? (showBatchNorm ? batchNormData : layerNormData)
        : originalData;

    return (
        <div className="w-full max-w-4xl p-8">
            <Card className="shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">
                        {showBatchNorm ? 'Batch' : 'Layer'} Normalization
                        {showNormalized ? ' (After)' : ' (Before)'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-8">
                        {/* Toggle Buttons */}
                        <div className="flex space-x-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                                onClick={() => setShowBatchNorm(!showBatchNorm)}>
                                Switch to {showBatchNorm ? 'Layer' : 'Batch'} Norm
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                                onClick={() => setShowNormalized(!showNormalized)}>
                                Show {showNormalized ? 'Before' : 'After'} Normalization
                            </button>
                        </div>

                        {/* Main Visualization */}
                        <div className="bg-gray-50 p-8 rounded-lg">
                            {/* Feature Labels */}
                            <div className="flex pl-32 mb-6">
                                {['feature[0]', 'feature[1]', 'feature[2]', 'feature[3]'].map((feature, i) => (
                                    <div key={i} className="w-24 text-center font-mono text-sm">
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            {/* Data Grid */}
                            <div className="flex flex-col space-y-4">
                                {currentData.map((row, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="w-32 font-mono text-sm pr-4">
                                            data_{i}
                                        </div>
                                        <div className="flex space-x-4">
                                            {row.map((val, j) => (
                                                <div
                                                    key={j}
                                                    className={`w-24 h-24 flex items-center justify-center text-white text-xl font-bold rounded-lg
                            ${showBatchNorm
                                                            ? (j % 2 === 0 ? 'bg-blue-500' : 'bg-green-500')
                                                            : (i % 2 === 0 ? 'bg-purple-500' : 'bg-pink-500')
                                                        }`}
                                                >
                                                    {typeof val === 'number' ? val.toFixed(2) : val}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calculation Details */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-bold">Normalization Calculation:</h3>
                            {showBatchNorm ? (
                                <div className="space-y-2">
                                    <p>For each feature column:</p>
                                    <div className="font-mono bg-white p-4 rounded mt-2 text-sm">
                                        feature[0]:<br />
                                        μ = mean(1, 2, 3) = 2<br />
                                        σ = std(1, 2, 3) = 1<br />
                                        normalized = (x - μ) / σ<br />
                                        result: [-1.00, 0.00, 1.00]
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p>For each data row:</p>
                                    <div className="font-mono bg-white p-4 rounded mt-2 text-sm">
                                        data_0:<br />
                                        μ = mean(1, 2, 3, 4) = 2.5<br />
                                        σ = std(1, 2, 3, 4) = 1.118<br />
                                        normalized = (x - μ) / σ<br />
                                        result: [-1.34, -0.45, 0.45, 1.34]
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NormalizationViz;