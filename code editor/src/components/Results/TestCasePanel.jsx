import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Terminal, Settings, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestCasePanel() {
  const {
    activeProblem,
    customTestCaseInput,
    setCustomTestCaseInput,
    runCode,
    runOutput,
    selectedLanguage
  } = useStore();

  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' | 'output'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Sync to output tab when code finishes running
  useEffect(() => {
    if (runOutput.status === 'loading') {
      setActiveTab('output');
    }
  }, [runOutput.status]);

  const handleClear = () => {
    setCustomTestCaseInput('');
  };

  const handleResetTestCase = () => {
    setCustomTestCaseInput(activeProblem.testCases[0]?.input || '');
  };

  return (
    <div className="h-full flex flex-col bg-[#16213e] text-[#e2e8f0]">
      
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between border-b border-[#2e3b5e] pb-2 mb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('testcase')}
            className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'testcase' ? 'text-blue-400 bg-[#1a1a2e] border border-[#2e3b5e]' : 'text-gray-400 hover:text-white'}`}
          >
            Testcase
          </button>
          
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg relative transition-colors ${activeTab === 'output' ? 'text-blue-400 bg-[#1a1a2e] border border-[#2e3b5e]' : 'text-gray-400 hover:text-white'}`}
          >
            <span>Result Output</span>
            {runOutput.status === 'success' && (
              <span className={`absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full ${runOutput.passed === runOutput.total ? 'bg-emerald-500' : 'bg-red-500'}`} />
            )}
          </button>
        </div>

        {activeTab === 'testcase' && (
          <div className="flex space-x-2">
            <button
              onClick={handleResetTestCase}
              className="text-[10px] font-extrabold uppercase text-gray-500 hover:text-gray-300 transition-colors"
            >
              Reset Default
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={handleClear}
              className="text-[10px] font-extrabold uppercase text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Panels body */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'testcase' ? (
            /* Tab: Input Editor */
            <motion.div
              key="testcase"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col space-y-2"
            >
              <div className="text-[10px] font-bold text-gray-500 tracking-wider flex items-center space-x-1">
                <Settings size={12} className="text-blue-400" />
                <span>INPUT ARGUMENTS (JSON FORMAT)</span>
              </div>
              
              <textarea
                value={customTestCaseInput}
                onChange={(e) => setCustomTestCaseInput(e.target.value)}
                placeholder='e.g. {"nums": [2, 7, 11, 15], "target": 9}'
                className="flex-1 w-full bg-[#0d1117] text-gray-300 font-mono text-xs p-3 rounded-xl border border-[#2e3b5e] focus:outline-none focus:border-blue-500 resize-none font-semibold shadow-inner"
              />
              
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold select-none py-1">
                <span>Variables are injected dynamically into your solution method.</span>
                <button
                  onClick={runCode}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-[#1a1a2e] text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors font-extrabold cursor-pointer"
                >
                  <RefreshCw size={10} className={runOutput.status === 'loading' ? 'animate-spin' : ''} />
                  <span>Run Custom</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Tab: Console Output */
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col overflow-y-auto space-y-4"
            >
              {runOutput.status === 'idle' && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-2 font-medium">
                  <Terminal size={32} className="text-gray-600" />
                  <p className="text-xs">Run your editor code to examine compiling output metrics.</p>
                </div>
              )}

              {runOutput.status === 'loading' && (
                /* Loading Animation skeleton */
                <div className="space-y-3 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-28 bg-[#1a1a2e] rounded animate-pulse" />
                    <div className="h-3 w-16 bg-[#1a1a2e] rounded animate-pulse" />
                  </div>
                  <div className="h-20 w-full bg-[#0d1117]/80 rounded-xl border border-[#2e3b5e]/40 p-4 space-y-2 flex flex-col justify-center">
                    <div className="h-2.5 w-2/3 bg-gray-700/30 rounded animate-pulse" />
                    <div className="h-2.5 w-1/2 bg-gray-700/30 rounded animate-pulse" />
                  </div>
                </div>
              )}

              {runOutput.status === 'error' && (
                /* Compilation Error Output */
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs select-none">
                    <AlertCircle size={16} />
                    <span>COMPILATION / RUNTIME EXCEPTION</span>
                  </div>
                  <pre className="p-4 bg-[#1f1315] border border-rose-950/50 rounded-xl font-mono text-xs text-rose-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {runOutput.error}
                  </pre>
                  {runOutput.stdout && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Stdout logs:</div>
                      <pre className="p-3 bg-[#0d1117] rounded-lg font-mono text-xs text-gray-400 whitespace-pre">{runOutput.stdout}</pre>
                    </div>
                  )}
                </div>
              )}

              {runOutput.status === 'success' && (
                /* Run Success Details */
                <div className="space-y-4">
                  {/* Results Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1a1a2e]/30 border border-[#2e3b5e]/40 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      {runOutput.passed === runOutput.total ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                      <span className="text-xs font-extrabold uppercase">
                        {runOutput.passed === runOutput.total ? 'ALL CASES PASSED' : 'SOME CASES FAILED'}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">
                        ({runOutput.passed} / {runOutput.total} test cases)
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold">
                      <Clock size={12} className="text-blue-400" />
                      <span>Time: <strong className="text-gray-300 font-mono font-semibold">{runOutput.time} ms</strong></span>
                    </div>
                  </div>

                  {/* Standard Test Cases Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 select-none">
                      {runOutput.results.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedCaseIdx(i)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            selectedCaseIdx === i
                              ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold'
                              : 'bg-[#1a1a2e] border-[#2e3b5e]/60 text-gray-400 hover:text-white'
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Test Case details */}
                    {runOutput.results[selectedCaseIdx] && (
                      <div className="bg-[#0d1117] border border-[#2e3b5e]/40 rounded-xl p-4 space-y-3 text-xs">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Input:</div>
                          <pre className="font-mono text-gray-300 font-semibold bg-[#1a1a2e]/60 p-2 rounded border border-[#2e3b5e]/20 overflow-x-auto whitespace-pre-wrap">{runOutput.results[selectedCaseIdx].input}</pre>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Output:</div>
                            <pre className="font-mono text-emerald-400 font-bold bg-[#1a1a2e]/60 p-2 rounded border border-[#2e3b5e]/20 overflow-x-auto whitespace-pre-wrap">{runOutput.results[selectedCaseIdx].expected}</pre>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Output:</div>
                            <pre className={`font-mono font-bold bg-[#1a1a2e]/60 p-2 rounded border border-[#2e3b5e]/20 overflow-x-auto whitespace-pre-wrap ${runOutput.results[selectedCaseIdx].passed ? 'text-emerald-400' : 'text-rose-500'}`}>{runOutput.results[selectedCaseIdx].actual}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Standard Console Output Logs */}
                  {runOutput.stdout && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">Console Log Output (Stdout)</div>
                      <pre className="p-4 bg-[#0d1117] border border-[#2e3b5e]/40 rounded-xl font-mono text-xs text-gray-400 overflow-x-auto whitespace-pre shadow-inner">
                        {runOutput.stdout}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
