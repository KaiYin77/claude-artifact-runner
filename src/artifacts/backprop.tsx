import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BackpropViz = () => {
    const [showBatchNorm, setShowBatchNorm] = useState(true);

    return (
        <div className="w-full max-w-4xl p-8">
            <Card className="shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">
                        Backpropagation through {showBatchNorm ? 'Batch' : 'Layer'} Normalization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-8">
                        {/* Toggle Button */}
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-fit"
                            onClick={() => setShowBatchNorm(!showBatchNorm)}>
                            Switch to {showBatchNorm ? 'Layer' : 'Batch'} Norm
                        </button>

                        {/* Forward Pass */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-4">Forward Pass:</h3>
                            <div className="font-mono text-sm space-y-2">
                                {/* Input and Statistics */}
                                <div className="bg-white p-4 rounded">
                                    <p>1. Calculate statistics:</p>
                                    <p className="mt-2">μ = mean(x) {showBatchNorm ? '(across batch)' : '(across features)'}</p>
                                    <p>σ² = var(x) {showBatchNorm ? '(across batch)' : '(across features)'}</p>
                                </div>
                                {/* Normalization */}
                                <div className="bg-white p-4 rounded mt-2">
                                    <p>2. Normalize:</p>
                                    <p className="mt-2">x̂ = (x - μ) / √(σ² + ε)</p>
                                </div>
                                {/* Scale and Shift */}
                                <div className="bg-white p-4 rounded mt-2">
                                    <p>3. Scale and shift:</p>
                                    <p className="mt-2">y = γx̂ + β</p>
                                    <p className="text-gray-600">(γ, β are learnable parameters)</p>
                                </div>
                            </div>
                        </div>

                        {/* Backward Pass */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-4">Backward Pass:</h3>
                            <div className="font-mono text-sm space-y-2">
                                {/* Gradients for parameters */}
                                <div className="bg-white p-4 rounded">
                                    <p>1. Parameter gradients:</p>
                                    <p className="mt-2">∂L/∂γ = Σ(∂L/∂y_i * x̂_i)</p>
                                    <p>∂L/∂β = Σ(∂L/∂y_i)</p>
                                </div>
                                {/* Gradients for normalized values */}
                                <div className="bg-white p-4 rounded mt-2">
                                    <p>2. Gradient for normalized values:</p>
                                    <p className="mt-2">∂L/∂x̂_i = ∂L/∂y_i * γ</p>
                                </div>
                                {/* Gradients for input */}
                                <div className="bg-white p-4 rounded mt-2">
                                    <p>3. Input gradients (most complex):</p>
                                    <p className="mt-2">∂L/∂x_i = [</p>
                                    <p className="pl-4">∂L/∂x̂_i * 1/√(σ² + ε)</p>
                                    <p className="pl-4">- 1/N * Σ_j(∂L/∂x̂_j) * 1/√(σ² + ε)</p>
                                    <p className="pl-4">- x̂_i/N * Σ_j(∂L/∂x̂_j * x̂_j)</p>
                                    <p>]</p>
                                    <p className="text-gray-600 mt-2">N = {showBatchNorm ? 'batch size' : 'number of features'}</p>
                                </div>
                                {/* Key Points */}
                                <div className="bg-white p-4 rounded mt-4">
                                    <p className="font-bold">Key Points:</p>
                                    <ul className="list-disc pl-5 mt-2">
                                        <li>Gradients flow through both mean and variance calculations</li>
                                        <li>Each input{"'"}s gradient depends on all other inputs in the normalization group</li>
                                        <li>Scale parameter γ affects gradient magnitude</li>
                                        <li>Moving statistics are not used for gradient computation in training</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BackpropViz;