import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { HelpCircle, Star, ThumbsUp, Landmark, Flame, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

// Hint Accordion Sub-Component
const HintAccordion = ({ index, hint }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#2e3b5e]/50 rounded-xl overflow-hidden bg-[#1a1a2e]/25">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-[#202d4f]/20 transition-all"
      >
        <span>Hint {index + 1}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-blue-400 font-bold"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-4 pb-3.5 pt-2 text-sm text-gray-400 border-t border-[#2e3b5e]/30 leading-relaxed">
              {hint}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProblemDescription() {
  const { activeProblem } = useStore();

  const difficultyColors = {
    Easy: '#00b8a3',
    Medium: '#ffc01e',
    Hard: '#ff375f'
  };

  const difficultyColor = difficultyColors[activeProblem.difficulty] || '#ffffff';

  return (
    <div className="space-y-6 pb-8 select-text pr-1.5">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wide">{activeProblem.title}</h1>
        
        {/* Sub-header statistics */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
          <span
            className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]"
            style={{
              backgroundColor: difficultyColor + '10',
              color: difficultyColor,
              border: `1px solid ${difficultyColor}25`
            }}
          >
            {activeProblem.difficulty}
          </span>
          <span className="flex items-center space-x-1">
            <ThumbsUp size={12} className="text-gray-400" />
            <span>Acceptance: <strong className="text-gray-300 font-semibold">{activeProblem.acceptanceRate}</strong></span>
          </span>
          <span className="hidden sm:inline w-[1px] h-3 bg-gray-700"></span>
          <span>Submissions: <strong className="text-gray-300 font-semibold">{activeProblem.totalSubmissions}</strong></span>
        </div>
      </div>

      {/* Main Markdown Body Statement */}
      <div className="text-sm text-gray-300 leading-relaxed markdown-body">
        <ReactMarkdown>{activeProblem.description}</ReactMarkdown>
      </div>

      {/* Examples section */}
      {activeProblem.examples && activeProblem.examples.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <Flame size={16} className="text-[#ffc01e]" />
            <span>Examples</span>
          </h3>
          
          <div className="space-y-3">
            {activeProblem.examples.map((ex, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e]/40 border border-[#2e3b5e]/40 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-[#2e3b5e]/70 transition-colors"
              >
                <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500/50"></div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Example {index + 1}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex gap-2">
                    <span className="text-gray-500 font-bold select-none min-w-[50px]">Input:</span>
                    <pre className="font-mono text-gray-300 font-semibold whitespace-pre-wrap">{ex.input}</pre>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 font-bold select-none min-w-[50px]">Output:</span>
                    <pre className="font-mono text-emerald-400 font-bold whitespace-pre-wrap">{ex.output}</pre>
                  </div>
                  {ex.explanation && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#2e3b5e]/20 text-gray-400">
                      <span className="text-gray-500 font-bold select-none min-w-[50px]">Explain:</span>
                      <p className="leading-relaxed">{ex.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints section */}
      {activeProblem.constraints && activeProblem.constraints.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <HelpCircle size={16} className="text-blue-400" />
            <span>Constraints</span>
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400 font-medium">
            {activeProblem.constraints.map((c, idx) => (
              <li key={idx} className="leading-relaxed">
                <code className="bg-[#1a1a2e] px-1.5 py-0.5 rounded border border-[#2e3b5e]/40 font-mono text-gray-300 text-[11px] font-semibold">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics pills */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
          <Compass size={16} className="text-teal-400" />
          <span>Topics</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2e3b5e]/30 text-gray-300 border border-[#2e3b5e]/50 cursor-default hover:bg-[#2e3b5e]/50 transition-colors">
            {activeProblem.category}
          </span>
        </div>
      </div>

      {/* Hints accordions */}
      {activeProblem.hints && activeProblem.hints.length > 0 && (
        <div className="space-y-3 pt-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <Landmark size={16} className="text-indigo-400" />
            <span>Hints</span>
          </h3>
          <div className="space-y-2">
            {activeProblem.hints.map((hint, idx) => (
              <HintAccordion key={idx} index={idx} hint={hint} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
