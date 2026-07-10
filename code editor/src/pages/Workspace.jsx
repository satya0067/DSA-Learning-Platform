import React, { useState, useEffect, useRef } from 'react';
import Split from 'react-split';
import { useStore } from '../store/useStore';
import TopNav from '../components/Problem/TopNav';
import LeftPanel from '../components/Problem/LeftPanel';
import EditorPanel from '../components/Editor/EditorPanel';
import TestCasePanel from '../components/Results/TestCasePanel';
import SubmissionResultPanel from '../components/Results/SubmissionResultPanel';
import { Layout, Code, BookOpen, Terminal, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Workspace() {
  const {
    runCode,
    submitCode,
    getCode,
    runOutput,
    submissionResult,
    isFullscreen
  } = useStore();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState('description'); // 'description' | 'editor' | 'testcase'
  const [toastMessage, setToastMessage] = useState('');

  // Horizontal and Vertical split sizes persisted
  const [horizontalSizes, setHorizontalSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('leetcode_split_horizontal');
      return saved ? JSON.parse(saved) : [45, 55];
    } catch (e) {
      return [45, 55];
    }
  });

  const [verticalSizes, setVerticalSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('leetcode_split_vertical');
      return saved ? JSON.parse(saved) : [65, 35];
    } catch (e) {
      return [65, 35];
    }
  });

  // Track window resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Enter
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        submitCode();
        showToast('Solution Submitted! (Shortcut)');
      }
      // Ctrl + '
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        runCode();
        showToast('Running Code... (Shortcut)');
      }
      // Ctrl + Shift + C (Copy Code)
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        const code = getCode();
        navigator.clipboard.writeText(code);
        showToast('Code Copied to Clipboard! (Shortcut)');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitCode, runCode, getCode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleHorizontalDragEnd = (sizes) => {
    setHorizontalSizes(sizes);
    localStorage.setItem('leetcode_split_horizontal', JSON.stringify(sizes));
  };

  const handleVerticalDragEnd = (sizes) => {
    setVerticalSizes(sizes);
    localStorage.setItem('leetcode_split_vertical', JSON.stringify(sizes));
  };

  return (
    <div className="h-screen w-screen bg-[#1a1a2e] flex flex-col text-[#e2e8f0] overflow-hidden select-none font-sans relative">
      
      {/* Top Header */}
      <TopNav />

      {/* Main Workspace Body */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#1a1a2e]">
        {isMobile ? (
          /* Mobile Layout: Tab Switcher */
          <div className="h-full flex flex-col pb-16">
            <div className="flex-1 overflow-y-auto p-4">
              {mobileActiveTab === 'description' && (
                <div className="h-full rounded-2xl bg-[#16213e] p-1 overflow-hidden shadow-lg border border-[#2e3b5e]/30">
                  <LeftPanel />
                </div>
              )}
              {mobileActiveTab === 'editor' && (
                <div className="h-full flex flex-col rounded-2xl bg-[#16213e] overflow-hidden shadow-lg border border-[#2e3b5e]/30">
                  <EditorPanel />
                </div>
              )}
              {mobileActiveTab === 'testcase' && (
                <div className="h-full rounded-2xl bg-[#16213e] p-4 overflow-y-auto shadow-lg border border-[#2e3b5e]/30">
                  <TestCasePanel />
                </div>
              )}
            </div>

            {/* Mobile Tab Control Buttons */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#16213e] border-t border-[#2e3b5e] flex justify-around items-center px-4 z-40">
              <button
                onClick={() => setMobileActiveTab('description')}
                className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${mobileActiveTab === 'description' ? 'text-blue-400 bg-[#1a1a2e] border border-[#2e3b5e]' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Description</span>
              </button>
              
              <button
                onClick={() => setMobileActiveTab('editor')}
                className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${mobileActiveTab === 'editor' ? 'text-blue-400 bg-[#1a1a2e] border border-[#2e3b5e]' : 'text-gray-400 hover:text-white'}`}
              >
                <Code size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Editor</span>
              </button>

              <button
                onClick={() => setMobileActiveTab('testcase')}
                className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${mobileActiveTab === 'testcase' ? 'text-blue-400 bg-[#1a1a2e] border border-[#2e3b5e]' : 'text-gray-400 hover:text-white'}`}
              >
                <Terminal size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Console</span>
              </button>
            </div>
          </div>
        ) : (
          /* Desktop & Tablet Split View */
          <Split
            className="flex h-full w-full p-3"
            sizes={horizontalSizes}
            minSize={300}
            expandToMin={false}
            gutterSize={8}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            onDragEnd={handleHorizontalDragEnd}
          >
            {/* Left Panel */}
            <div className="h-full bg-[#16213e] rounded-2xl overflow-hidden shadow-xl border border-[#2e3b5e]/40 relative flex flex-col">
              <LeftPanel />
            </div>

            {/* Right Panel (Split Editor & Console) */}
            {isFullscreen ? (
              // Fullscreen Editor Panel Mode
              <div className="h-full bg-[#16213e] rounded-2xl overflow-hidden shadow-xl border border-[#2e3b5e]/40 flex flex-col relative z-20">
                <EditorPanel />
              </div>
            ) : (
              <Split
                className="flex flex-col h-full w-full overflow-hidden"
                sizes={verticalSizes}
                minSize={150}
                gutterSize={8}
                direction="vertical"
                onDragEnd={handleVerticalDragEnd}
              >
                {/* Upper Split: Editor */}
                <div className="h-full bg-[#16213e] rounded-2xl overflow-hidden shadow-xl border border-[#2e3b5e]/40 flex flex-col relative">
                  <EditorPanel />
                </div>

                {/* Lower Split: TestCase Output */}
                <div className="h-full bg-[#16213e] rounded-2xl p-4 overflow-y-auto shadow-xl border border-[#2e3b5e]/40 flex flex-col">
                  <TestCasePanel />
                </div>
              </Split>
            )}
          </Split>
        )}
      </div>

      {/* Submission Result Drawer Backdrop Panel */}
      <SubmissionResultPanel />

      {/* Action Keyboard Shortcut Toast Message popups */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 bg-[#16213e] border-2 border-blue-500/50 text-white font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm"
          >
            <ClipboardCheck size={18} className="text-blue-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
