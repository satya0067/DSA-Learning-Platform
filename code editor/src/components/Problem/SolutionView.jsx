import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Clock, HardDrive, AlertTriangle, Sparkles, BookOpen, GraduationCap, Compass, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function SolutionView() {
  const { activeProblem, selectedLanguage } = useStore();
  const [showEasyExplanation, setShowEasyExplanation] = useState(false);
  const [subTab, setSubTab] = useState('walkthrough'); // 'walkthrough' | 'editorial'

  const solutionCode = activeProblem.solutions[selectedLanguage] || activeProblem.solutions.javascript;
  
  // Try to parse complexities from the solution comments, or default
  const timeComplexity = activeProblem.id === 1 ? 'O(N)' : activeProblem.id === 2 ? 'O(log10(x))' : activeProblem.id === 3 ? 'O(N²)' : activeProblem.id === 4 ? 'O(N)' : 'O(N)';
  const spaceComplexity = activeProblem.id === 1 ? 'O(N)' : activeProblem.id === 2 ? 'O(1)' : activeProblem.id === 3 ? 'O(1)' : activeProblem.id === 4 ? 'O(N)' : 'O(1)';

  return (
    <div className="space-y-6 pb-8 select-text pr-1.5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2e3b5e]/30 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Reference Solution</h2>
          <p className="text-xs text-gray-400 mt-1">Review the optimal algorithm architecture below to understand efficiency parameters.</p>
        </div>

        {/* Explain in Easy Way Toggle */}
        <button
          onClick={() => setShowEasyExplanation(!showEasyExplanation)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm self-start sm:self-center ${
            showEasyExplanation
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-blue-500/10'
              : 'bg-[#1a1a2e]/40 text-gray-400 border-[#2e3b5e]/40 hover:border-gray-500/30 hover:text-gray-200'
          }`}
        >
          <Sparkles size={14} className={showEasyExplanation ? 'animate-pulse text-blue-400' : 'text-gray-400'} />
          <span>💡 Simple Explanation (Optional)</span>
        </button>
      </div>

      {/* Easy Explanation Card */}
      <AnimatePresence initial={false}>
        {showEasyExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-[#202d4f]/20 border border-blue-500/25 rounded-2xl p-4.5 space-y-2.5 shadow-lg select-text">
              <div className="flex items-center space-x-2 text-xs font-black text-blue-400 uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Explain Like I'm 5 (ELI5)</span>
              </div>
              <div className="text-xs leading-relaxed text-gray-300 font-medium markdown-body space-y-2">
                <ReactMarkdown>{activeProblem.easyExplanation || "No simplified explanation available."}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-tabs Selection Navigation Menu */}
      <div className="flex bg-[#131a2c]/60 p-1 rounded-xl border border-[#2e3b5e]/40 w-full sm:w-fit">
        <button
          onClick={() => setSubTab('walkthrough')}
          className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 py-1.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            subTab === 'walkthrough'
              ? 'bg-blue-500/25 text-blue-400 border border-blue-500/25 shadow-md'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <BookOpen size={13} />
          <span>Walkthrough</span>
        </button>
        <button
          onClick={() => setSubTab('editorial')}
          className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 py-1.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            subTab === 'editorial'
              ? 'bg-blue-500/25 text-blue-400 border border-blue-500/25 shadow-md'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <GraduationCap size={14} />
          <span>Editorial</span>
        </button>
      </div>

      {/* Sub-tab Panels */}
      <div className="space-y-6">
        {subTab === 'walkthrough' ? (
          /* Walkthrough Sub-tab: Approach, Code, and Detailed Explanation */
          <>
            {/* Complexity Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time Card */}
              <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-4 flex items-center space-x-3 hover:border-blue-500/30 transition-colors">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Time Complexity</div>
                  <div className="text-base font-extrabold text-white font-mono">{timeComplexity}</div>
                </div>
              </div>

              {/* Space Card */}
              <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-4 flex items-center space-x-3 hover:border-emerald-500/30 transition-colors">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <HardDrive size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Space Complexity</div>
                  <div className="text-base font-extrabold text-white font-mono">{spaceComplexity}</div>
                </div>
              </div>
            </div>

            {/* Approach Description */}
            <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Compass size={14} className="text-blue-400" />
                <span>Approach & Intuition</span>
              </h3>
              <div className="text-xs leading-relaxed text-gray-300 markdown-body">
                <ReactMarkdown>{activeProblem.approach || "No approach description available."}</ReactMarkdown>
              </div>
            </div>

            {/* Alert when viewing general javascript placeholder */}
            {!activeProblem.solutions[selectedLanguage] && (
              <div className="flex items-start space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Note: Detailed reference code is shown in <strong>JavaScript</strong> as a compiler-compatible standard since language is not fully custom templates.</span>
              </div>
            )}

            {/* Reference Implementation Code Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500 font-bold px-2">
                <span>{(!activeProblem.solutions[selectedLanguage] ? 'javascript' : selectedLanguage).toUpperCase()} IMPLEMENTATION</span>
              </div>
              <pre className="p-4 bg-[#0d1117] border border-[#2e3b5e]/50 rounded-xl font-mono text-xs text-[#e2e8f0] overflow-x-auto whitespace-pre leading-relaxed select-all">
                {solutionCode}
              </pre>
            </div>

            {/* Detailed Walkthrough */}
            <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText size={14} className="text-emerald-400" />
                <span>Code Walkthrough In Detail</span>
              </h3>
              <div className="text-xs leading-relaxed text-gray-300 markdown-body">
                <ReactMarkdown>{activeProblem.detailedWalkthrough || "No detailed walkthrough available."}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          /* Editorial Sub-tab: Comparative Analysis */
          <div className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-[#2e3b5e]/30 pb-3">
              <GraduationCap size={16} />
              <span>Editorial Deep Dive & Tradeoffs</span>
            </div>
            <div className="text-xs leading-relaxed text-gray-300 markdown-body space-y-3">
              <ReactMarkdown>{activeProblem.editorial || "No editorial analysis available for this problem."}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

