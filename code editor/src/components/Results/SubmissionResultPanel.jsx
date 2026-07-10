import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart4, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmissionResultPanel() {
  const { submissionResult } = useStore();
  const [isFailedCaseOpen, setIsFailedCaseOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sync open state with store submission results
  React.useEffect(() => {
    if (submissionResult) {
      setIsOpen(true);
      setIsFailedCaseOpen(false); // Reset accordion
    }
  }, [submissionResult]);

  if (!submissionResult || !isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Wrong Answer': return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
      case 'Compilation Error': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      default: return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle size={28} className="text-emerald-400" />;
      case 'Wrong Answer': return <XCircle size={28} className="text-rose-500" />;
      case 'Compilation Error': return <AlertTriangle size={28} className="text-amber-500" />;
      default: return <XCircle size={28} className="text-rose-500" />;
    }
  };

  // Generate randomized beat statistics for display
  const beatsRuntime = 85.4;
  const beatsMemory = 74.8;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
        
        {/* Modal body container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#16213e] border border-[#2e3b5e] rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2e3b5e]/60 flex items-center justify-between bg-[#131a2c]">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Submission Evaluation Report</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-[#1a1a2e] border border-[#2e3b5e]/40 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status Section */}
            <div className={`p-5 rounded-2xl border flex items-center space-x-4 ${getStatusColor(submissionResult.status)}`}>
              <div className="bg-[#1a1a2e]/55 p-2 rounded-xl border border-white/5">
                {getStatusIcon(submissionResult.status)}
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-wide leading-none">{submissionResult.status}</h2>
                <p className="text-xs font-bold text-gray-400">
                  {submissionResult.status === 'Accepted'
                    ? `Passed All ${submissionResult.passed} / ${submissionResult.total} Test Cases`
                    : submissionResult.status === 'Compilation Error'
                      ? 'Code failed to compile cleanly.'
                      : `Passed ${submissionResult.passed} / ${submissionResult.total} Test Cases`}
                </p>
              </div>
            </div>

            {/* If Compilation Error, display the log */}
            {submissionResult.status === 'Compilation Error' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Compiler Error Log:</div>
                <pre className="p-4 bg-[#1f1315] border border-rose-950/50 rounded-xl font-mono text-xs text-rose-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {submissionResult.error}
                </pre>
              </div>
            )}

            {/* Graphs / Efficiency comparison charts (only show if running successfully or WA) */}
            {submissionResult.status !== 'Compilation Error' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Runtime Bell Curve Box */}
                <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <TrendingUp size={14} className="text-blue-400" />
                      <span>Runtime Efficiency</span>
                    </span>
                    <span className="text-blue-400 font-mono font-semibold">{submissionResult.runtime || 30} ms</span>
                  </div>
                  
                  {/* SVG Bell Curve */}
                  <div className="h-20 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      {/* Bell curve line */}
                      <path
                        d="M 0 30 Q 30 30 45 5 T 55 5 Q 70 30 100 30"
                        fill="url(#runtimeGradient)"
                        stroke="#3b82f6"
                        strokeWidth="1"
                      />
                      <defs>
                        <linearGradient id="runtimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      {/* Indicator dot */}
                      <circle cx="50" cy="5" r="2.5" fill="#ef4444" className="animate-ping" />
                      <circle cx="50" cy="5" r="1.5" fill="#ef4444" />
                    </svg>
                  </div>
                  
                  <div className="text-center text-[10px] text-gray-500 font-bold uppercase leading-none select-none">
                    Beats <strong className="text-emerald-400">{beatsRuntime}%</strong> of JavaScript developers.
                  </div>
                </div>

                {/* Memory Bell Curve Box */}
                <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <BarChart4 size={14} className="text-emerald-400" />
                      <span>Memory Allocations</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-semibold">{submissionResult.memory || 14.2} MB</span>
                  </div>
                  
                  {/* SVG Bell Curve */}
                  <div className="h-20 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      {/* Bell curve line */}
                      <path
                        d="M 0 30 Q 20 30 40 10 T 60 10 Q 80 30 100 30"
                        fill="url(#memoryGradient)"
                        stroke="#10b981"
                        strokeWidth="1"
                      />
                      <defs>
                        <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      {/* Indicator dot */}
                      <circle cx="48" cy="10" r="2.5" fill="#ef4444" className="animate-ping" />
                      <circle cx="48" cy="10" r="1.5" fill="#ef4444" />
                    </svg>
                  </div>

                  <div className="text-center text-[10px] text-gray-500 font-bold uppercase leading-none select-none">
                    Beats <strong className="text-emerald-400">{beatsMemory}%</strong> of JavaScript developers.
                  </div>
                </div>

              </div>
            )}

            {/* Failed Test Case Accordion */}
            {submissionResult.status === 'Wrong Answer' && submissionResult.failedTestCase && (
              <div className="border border-[#2e3b5e]/60 rounded-2xl overflow-hidden bg-[#1a1a2e]/30 select-text">
                <button
                  onClick={() => setIsFailedCaseOpen(!isFailedCaseOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-xs font-black uppercase text-rose-400 hover:bg-[#202d4f]/20 transition-colors"
                >
                  <span>Examine Failed Test Case</span>
                  {isFailedCaseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {isFailedCaseOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#2e3b5e]/40 p-5 space-y-4 bg-[#0d1117]/60 text-xs"
                    >
                      {/* Input */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Input:</div>
                        <pre className="font-mono text-gray-300 font-semibold bg-[#1a1a2e]/80 p-2.5 rounded border border-[#2e3b5e]/30 overflow-x-auto whitespace-pre-wrap">{submissionResult.failedTestCase.input}</pre>
                      </div>

                      {/* Side-by-side Expected vs Actual with Diff Highlight styling */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Output:</div>
                          <pre className="font-mono text-emerald-400 font-bold bg-[#14261d]/80 p-2.5 rounded border border-emerald-900/40 overflow-x-auto whitespace-pre-wrap">{submissionResult.failedTestCase.expected}</pre>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Output:</div>
                          <pre className="font-mono text-rose-400 font-bold bg-[#29171a]/80 p-2.5 rounded border border-rose-950/40 overflow-x-auto whitespace-pre-wrap">{submissionResult.failedTestCase.actual}</pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Footer close button */}
          <div className="p-4 border-t border-[#2e3b5e]/60 bg-[#131a2c] flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all shadow-lg shadow-blue-950/30 cursor-pointer"
            >
              Back to Editor
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
