import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const BitToggleVisualizer = () => {
  const [config, setConfig] = useState({
    inputWidth: 3,
    inputHeight: 3,
    kernelWidth: 3,
    kernelHeight: 3
  });

  const [inputData, setInputData] = useState([]);
  const [weights, setWeights] = useState([]);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [multiplyToggleCount, setMultiplyToggleCount] = useState({});
  const [accumulatorToggleCount, setAccumulatorToggleCount] = useState({});
  const [error, setError] = useState('');

  // Initialize matrices when configuration changes
  useEffect(() => {
    try {
      const newInputData = Array(config.inputHeight).fill(0)
        .map(() => Array(config.inputWidth).fill('0x4000'));
      const newWeights = Array(config.kernelHeight).fill(0)
        .map(() => Array(config.kernelWidth).fill('0x3FFF'));
      
      setInputData(newInputData);
      setWeights(newWeights);
      setHistory([]);
      setStep(0);
      setMultiplyToggleCount({});
      setAccumulatorToggleCount({});
      setError('');
    } catch (err) {
      setError('Invalid configuration');
    }
  }, [config]);

  // File upload handlers
  const handleInputUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      console.log('Reading file:', file.name);
      const text = await file.text();
      console.log('File content:', text);
      
      // Split into rows and clean any empty lines
      const rows = text.trim().split('\n').filter(row => row.trim());
      console.log('Parsed rows:', rows);
      
      const newData = rows.map(row => {
        const values = row.trim().split(/[\s,]+/);
        console.log('Row values:', values);
        
        return values.map(val => {
          let hexVal = val.toLowerCase().trim();
          if (!hexVal.startsWith('0x')) {
            hexVal = '0x' + hexVal;
          }
          
          if (!validateHex(hexVal)) {
            throw new Error('Invalid hex value: ' + val);
          }
          return hexVal;
        });
      });
      
      console.log('Processed data:', newData);
      
      if (newData.length !== config.inputHeight) {
        throw new Error(`Expected ${config.inputHeight} rows but got ${newData.length}`);
      }
      
      if (newData[0].length !== config.inputWidth) {
        throw new Error(`Expected ${config.inputWidth} columns but got ${newData[0].length}`);
      }
      
      setInputData(newData);
      setError('');
      
      // Reset file input
      event.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error reading input file: ' + err.message);
      event.target.value = '';
    }
  };

  const handleWeightUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const rows = text.trim().split('\n');
      const newWeights = rows.map(row => 
        row.trim().split(/[\s,]+/).map(val => {
          const hexVal = val.startsWith('0x') ? val : '0x' + val;
          if (!validateHex(hexVal)) throw new Error('Invalid hex value: ' + val);
          return hexVal;
        })
      );
      
      if (newWeights.length !== config.kernelHeight || 
          newWeights[0].length !== config.kernelWidth) {
        setError('Uploaded file dimensions do not match configuration');
        return;
      }
      
      setWeights(newWeights);
      setError('');
    } catch (err) {
      setError('Error reading weight file: ' + err.message);
    }
  };



  const validateHex = (value) => {
    try {
      const hexValue = value.startsWith('0x') ? value : '0x' + value;
      // First verify it's a valid hex string
      if (!/^0x[0-9a-f]+$/i.test(hexValue)) {
        return false;
      }
      
      const num = parseInt(hexValue, 16);
      // Check if it's a valid number
      if (isNaN(num)) {
        return false;
      }
      
      // Convert to signed 16-bit
      const signed = num << 16 >> 16;
      return signed >= -32768 && signed <= 32767;
    } catch (err) {
      console.error('Validation error:', err);
      return false;
    }
  };

  const updateInputData = (row, col, value) => {
    const newData = [...inputData];
    try {
      if (!value.startsWith('0x')) value = '0x' + value;
      if (!validateHex(value)) throw new Error('Invalid hex value');
      newData[row][col] = value;
      setInputData(newData);
      setError('');
    } catch (err) {
      setError('Invalid input value');
    }
  };

  const updateWeights = (row, col, value) => {
    const newWeights = [...weights];
    try {
      if (!value.startsWith('0x')) value = '0x' + value;
      if (!validateHex(value)) throw new Error('Invalid hex value');
      newWeights[row][col] = value;
      setWeights(newWeights);
      setError('');
    } catch (err) {
      setError('Invalid weight value');
    }
  };

  const toBinary = (num, bits) => {
    if (typeof num === 'bigint') {
      // Handle negative BigInts
      if (num < 0n) {
        num = (1n << BigInt(bits)) + num;
      }
      return num.toString(2).padStart(bits, '0');
    }
    if (typeof num !== 'number') return '0'.repeat(bits);
    return (num >>> 0).toString(2).padStart(bits, '0');
  };

  const toHex = (num, padLength) => {
    if (typeof num === 'bigint') {
      // Handle negative BigInts
      if (num < 0n) {
        const bits = padLength * 4; // Each hex digit is 4 bits
        num = (1n << BigInt(bits)) + num;
      }
      return num.toString(16).toUpperCase().padStart(padLength, '0');
    }
    if (typeof num !== 'number') return '0'.repeat(padLength);
    return num.toString(16).toUpperCase().padStart(padLength, '0');
  };

  const calculateOutputDimensions = () => {
    const outputHeight = config.inputHeight - config.kernelHeight + 1;
    const outputWidth = config.inputWidth - config.kernelWidth + 1;
    return { outputHeight, outputWidth };
  };

  const calculateStep = (stepNum) => {
    if (stepNum === 0) return { multiply: 0n, accumulator: 0n };
    
    const { outputHeight, outputWidth } = calculateOutputDimensions();
    const totalSteps = outputHeight * outputWidth * config.kernelHeight * config.kernelWidth;
    const currentStep = stepNum - 1;
    
    // Calculate output position
    const outputPos = Math.floor(currentStep / (config.kernelHeight * config.kernelWidth));
    const outputY = Math.floor(outputPos / outputWidth);
    const outputX = outputPos % outputWidth;
    
    // Calculate kernel position
    const kernelPos = currentStep % (config.kernelHeight * config.kernelWidth);
    const kernelY = Math.floor(kernelPos / config.kernelWidth);
    const kernelX = kernelPos % config.kernelWidth;
    
    // Calculate input position (stride is fixed at 1)
    const inputY = outputY + kernelY;
    const inputX = outputX + kernelX;
    
    // Convert hex inputs to BigInt for precise arithmetic
    const input = BigInt(parseInt(inputData[inputY][inputX], 16));
    const weight = BigInt(parseInt(weights[kernelY][kernelX], 16));
    
    // Sign extend to 16-bit
    const signExtendTo16 = (val) => {
      if (val & (1n << 15n)) {
        return val | (BigInt(0xFFFF) << 16n);
      }
      return val;
    };
    
    // Do signed multiplication
    const signedInput = signExtendTo16(input & BigInt(0xFFFF));
    const signedWeight = signExtendTo16(weight & BigInt(0xFFFF));
    let multiply = signedInput * signedWeight; // This will be 32-bit
    
    // Ensure multiply result is exactly 32 bits
    multiply = multiply & ((1n << 32n) - 1n);
    
    // Calculate accumulator with proper carry propagation
    let accumulator = 0n;
    for (let i = 0; i < stepNum; i++) {
      const pos = i;
      const outPos = Math.floor(pos / (config.kernelHeight * config.kernelWidth));
      const outY = Math.floor(outPos / outputWidth);
      const outX = outPos % outputWidth;
      const kPos = pos % (config.kernelHeight * config.kernelWidth);
      const kY = Math.floor(kPos / config.kernelWidth);
      const kX = kPos % config.kernelWidth;
      const inY = outY + kY;
      const inX = outX + kX;
      
      const inp = BigInt(parseInt(inputData[inY][inX], 16));
      const w = BigInt(parseInt(weights[kY][kX], 16));
      const signedInp = signExtendTo16(inp & BigInt(0xFFFF));
      const signedW = signExtendTo16(w & BigInt(0xFFFF));
      accumulator += signedInp * signedW;
    }
    
    // Ensure accumulator stays within 40 bits
    accumulator = accumulator & ((1n << 40n) - 1n);
    
    return { 
      input: Number(input),
      weight: Number(weight),
      multiply,
      accumulator,
      position: {
        input: `(${inputY},${inputX})`,
        kernel: `(${kernelY},${kernelX})`,
        output: `(${outputY},${outputX})`
      }
    };
  };

  const getToggleStyle = (toggleCount) => {
    if (toggleCount === 0) return { backgroundColor: 'white' };
    const alpha = Math.min(toggleCount / 9, 1.0);
    return { backgroundColor: `rgba(255, 0, 0, ${alpha})` };
  };

  const renderBits = (current, previous, bits, toggleCounts) => {
    const currentBits = toBinary(current, bits);
    const previousBits = toBinary(previous, bits);

    return (
      <div className="font-mono flex flex-wrap">
        {currentBits.split('').map((bit, index) => {
          const toggleCount = toggleCounts[index] || 0;
          return (
            <span
              key={index}
              className="w-6 h-6 flex items-center justify-center border border-gray-300"
              style={getToggleStyle(toggleCount)}
            >
              {bit}
            </span>
          );
        })}
      </div>
    );
  };

  const renderMatrix = (matrix, onUpdate, label, onUpload) => (
    <div className="min-w-fit space-y-2">
      <div className="flex items-center gap-4">
        <h3 className="font-semibold">{label}:</h3>
        <label className="px-4 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
          Upload
          <input 
            type="file" 
            onChange={onUpload}
            accept=".txt"
            className="hidden"
          />
        </label>
      </div>
      <div className="inline-block">
        <div className="grid gap-2">
          {matrix.map((row, i) => (
            <div key={i} className="flex gap-2 whitespace-nowrap">
              {row.map((value, j) => (
                <input
                  key={j}
                  type="text"
                  value={value.replace('0x', '')}
                  onChange={(e) => onUpdate(i, j, e.target.value)}
                  className="w-20 px-2 py-1 border rounded font-mono text-sm"
                  placeholder="hex"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const updateToggleCounts = (current, previous, bits, setToggleCount) => {
    if (!previous) return;
    
    const currentBits = toBinary(current, bits);
    const previousBits = toBinary(previous, bits);
    
    setToggleCount(prev => {
      const newCounts = { ...prev };
      for (let i = 0; i < bits; i++) {
        if (currentBits[i] !== previousBits[i]) {
          newCounts[i] = (newCounts[i] || 0) + 1;
        }
      }
      return newCounts;
    });
  };

  const handleNextStep = () => {
    const totalSteps = config.inputWidth * config.inputHeight;
    if (step < totalSteps) {
      const current = calculateStep(step);
      const next = calculateStep(step + 1);
      
      updateToggleCounts(next.multiply, current.multiply, 32, setMultiplyToggleCount);
      updateToggleCounts(next.accumulator, current.accumulator, 40, setAccumulatorToggleCount);
      
      setHistory(prev => [...prev, next]);
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setHistory([]);
    setMultiplyToggleCount({});
    setAccumulatorToggleCount({});
  };

  const current = calculateStep(step);

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>CNN Bit Toggle Visualizer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <div className="space-y-2">
              <h3 className="font-bold">Input Shape:</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  Width:
                  <input
                    type="number"
                    value={config.inputWidth}
                    onChange={(e) => setConfig({...config, inputWidth: parseInt(e.target.value)})}
                    className="w-20 px-2 py-1 border rounded"
                    min="1"
                    max="8"
                  />
                </label>
                <label className="flex items-center gap-2">
                  Height:
                  <input
                    type="number"
                    value={config.inputHeight}
                    onChange={(e) => setConfig({...config, inputHeight: parseInt(e.target.value)})}
                    className="w-20 px-2 py-1 border rounded"
                    min="1"
                    max="8"
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Kernel Shape:</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  Width:
                  <input
                    type="number"
                    value={config.kernelWidth}
                    onChange={(e) => setConfig({...config, kernelWidth: parseInt(e.target.value)})}
                    className="w-20 px-2 py-1 border rounded"
                    min="1"
                    max="8"
                  />
                </label>
                <label className="flex items-center gap-2">
                  Height:
                  <input
                    type="number"
                    value={config.kernelHeight}
                    onChange={(e) => setConfig({...config, kernelHeight: parseInt(e.target.value)})}
                    className="w-20 px-2 py-1 border rounded"
                    min="1"
                    max="8"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Data Input */}
          <div className="grid grid-cols-2 gap-8">
            <div className="overflow-x-auto pb-4">
              {renderMatrix(
                inputData, 
                updateInputData, 
                "Input Data (16-bit hex)",
                handleInputUpload
              )}
            </div>
            <div className="overflow-x-auto pb-4">
              {renderMatrix(
                weights, 
                updateWeights, 
                "Weights (16-bit hex)",
                handleWeightUpload
              )}
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-4">
            <button
              onClick={handleNextStep}
              disabled={step >= config.inputWidth * config.inputHeight}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Next Step
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded">
              Step: {step}/{config.inputWidth * config.inputHeight}
            </span>
          </div>

          {/* Results */}
          {step > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold">Current Result:</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Multiplication Result (32-bit):</h4>
                    {renderBits(current.multiply, history[history.length - 2]?.multiply, 32, multiplyToggleCount)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Accumulator (40-bit):</h4>
                    {renderBits(current.accumulator, history[history.length - 2]?.accumulator, 40, accumulatorToggleCount)}
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="space-y-2">
                <h3 className="font-bold">Operation History:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Step</th>
                        <th className="px-4 py-2 text-left">Position (out,in,kern)</th>
                        <th className="px-4 py-2 text-left">Input (16-bit)</th>
                        <th className="px-4 py-2 text-left">Weight (16-bit)</th>
                        <th className="px-4 py-2 text-left">Multiply Result (32-bit)</th>
                        <th className="px-4 py-2 text-left">Accumulator (40-bit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{idx + 1}</td>
                          <td className="px-4 py-2 font-mono">
                            {entry.position.output},{entry.position.input},{entry.position.kernel}
                          </td>
                          <td className="px-4 py-2 font-mono">0x{toHex(entry.input, 4)}</td>
                          <td className="px-4 py-2 font-mono">0x{toHex(entry.weight, 4)}</td>
                          <td className="px-4 py-2 font-mono">0x{toHex(entry.multiply, 8)}</td>
                          <td className="px-4 py-2 font-mono">0x{toHex(entry.accumulator, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BitToggleVisualizer;