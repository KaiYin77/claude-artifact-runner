import React, { useState, useEffect } from 'react';

const PllCalculator = () => {
    const [multiplier, setMultiplier] = useState('');
    const [divider, setDivider] = useState('');
    const [frequency, setFrequency] = useState(null);
    const [history, setHistory] = useState([]);

    // Calculate frequency when multiplier or divider changes
    useEffect(() => {
        if (multiplier && divider && parseFloat(divider) !== 0) {
            const result = (parseFloat(multiplier) * 11.059) / parseFloat(divider);
            setFrequency(result);
        } else {
            setFrequency(null);
        }
    }, [multiplier, divider]);

    // Save calculation to history
    const saveCalculation = () => {
        if (multiplier && divider && frequency !== null) {
            const calculation = {
                multiplier: parseFloat(multiplier),
                divider: parseFloat(divider),
                frequency: frequency
            };
            setHistory([calculation, ...history.slice(0, 9)]); // Keep last 10 calculations
        }
    };

    // Load a calculation from history
    const loadCalculation = (calc) => {
        setMultiplier(calc.multiplier.toString());
        setDivider(calc.divider.toString());
    };

    return (
        <div className="flex flex-col space-y-6 p-6 bg-gray-100 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-center text-gray-800">PLL Frequency Calculator</h1>

            {/* Formula display */}
            <div className="text-center text-lg bg-white p-3 rounded-lg shadow-inner">
                <span className="font-mono">
                    {multiplier || '_'} * 11.059 / {divider || '_'} = {frequency !== null ? frequency.toFixed(3) : '_____'} MHz
                </span>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Multiplier</label>
                    <input
                        type="number"
                        value={multiplier}
                        onChange={(e) => setMultiplier(e.target.value)}
                        placeholder="Enter multiplier"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Divider</label>
                    <input
                        type="number"
                        value={divider}
                        onChange={(e) => setDivider(e.target.value)}
                        placeholder="Enter divider"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Frequency result */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                    <div className="text-gray-700 mb-1">Calculated Frequency:</div>
                    <div className="text-3xl font-bold text-blue-700">
                        {frequency !== null ? `${frequency.toFixed(3)} MHz` : '—'}
                    </div>
                </div>
            </div>

            {/* Save button */}
            <button
                onClick={saveCalculation}
                disabled={!multiplier || !divider || frequency === null}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Save Calculation
            </button>

            {/* History section */}
            {history.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2">Calculation History</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {history.map((calc, index) => (
                            <div
                                key={index}
                                className="p-2 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                onClick={() => loadCalculation(calc)}
                            >
                                <div className="font-mono">
                                    {calc.multiplier} * 11.059 / {calc.divider}
                                </div>
                                <div className="font-bold text-blue-600">
                                    {calc.frequency.toFixed(3)} MHz
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick reference table */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h3 className="font-semibold mb-2 text-center">Common Clock Settings</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-yellow-100">
                                <th className="p-1 text-left">Multiplier</th>
                                <th className="p-1 text-left">Divider</th>
                                <th className="p-1 text-left">Frequency</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-yellow-100">
                                <td className="p-1">18</td>
                                <td className="p-1">8</td>
                                <td className="p-1">24.882 MHz</td>
                            </tr>
                            <tr className="border-b border-yellow-100">
                                <td className="p-1">30</td>
                                <td className="p-1">8</td>
                                <td className="p-1">41.471 MHz</td>
                            </tr>
                            <tr className="border-b border-yellow-100">
                                <td className="p-1">36</td>
                                <td className="p-1">4</td>
                                <td className="p-1">99.531 MHz</td>
                            </tr>
                            <tr>
                                <td className="p-1">54</td>
                                <td className="p-1">1</td>
                                <td className="p-1">597.186 MHz</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PllCalculator;