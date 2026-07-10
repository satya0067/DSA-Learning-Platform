import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { RotateCcw, Copy, Maximize2, Minimize2, Check, AlertTriangle, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditorPanel() {
  const {
    selectedLanguage,
    setLanguage,
    getCode,
    updateCode,
    resetCode,
    activeProblem,
    isFullscreen,
    setFullscreen
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // force re-render editor when loading defaults

  // Re-trigger editor key to force updates on problem or language changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [activeProblem.id, selectedLanguage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    resetCode();
    setShowResetConfirm(false);
    showToast('Code Reset Successfully!');
  };

  // Custom theme registration in Monaco
  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.defineTheme('structLearnTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'regexp', foreground: 'e06c75' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'class', foreground: '61afef', fontStyle: 'bold' },
        { token: 'function', foreground: '61afef' }
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#1e2430',
        'editorCursor.foreground': '#528bff',
        'editor.selectionBackground': '#3e4451',
        'editorLineNumber.foreground': '#4b5263',
        'editorLineNumber.activeForeground': '#c8ccd4',
        'editorGutter.background': '#0d1117'
      }
    });
    monaco.editor.setTheme('structLearnTheme');
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0d1117] rounded-2xl overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#16213e] border-b border-[#2e3b5e] flex items-center justify-between px-4 select-none">
        
        {/* Left: Language Select */}
        <div className="flex items-center space-x-2">
          <Code2 size={16} className="text-blue-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1a1a2e] text-[#e2e8f0] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#2e3b5e] focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Reset Code */}
          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              className="p-2 rounded-lg bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#202d4f] border border-[#2e3b5e]/40 transition-colors"
              title="Reset Code Template"
            >
              <RotateCcw size={14} />
            </button>
            
            {/* Reset confirmation popover */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-10 z-30 bg-[#16213e] border border-[#2e3b5e] rounded-xl p-3 shadow-2xl flex flex-col space-y-2 w-48 text-left border-rose-500/20"
                >
                  <div className="flex items-start space-x-1.5 text-[11px] text-gray-300 font-bold leading-normal">
                    <AlertTriangle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>Reset this editor? You will lose all active changes.</span>
                  </div>
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 rounded bg-[#1a1a2e] text-[10px] text-gray-400 hover:text-white border border-[#2e3b5e] font-bold"
                    >
                      No
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-[10px] text-white font-bold"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#202d4f] border border-[#2e3b5e]/40 transition-colors flex items-center justify-center"
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#202d4f] border border-[#2e3b5e]/40 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative">
        <Editor
          key={editorKey}
          height="100%"
          language={selectedLanguage}
          value={getCode()}
          onChange={(val) => updateCode(val || '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] text-gray-500 space-y-2">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold tracking-wider uppercase">Loading Monaco...</span>
            </div>
          }
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            autoIndent: 'full',
            wordWrap: 'on',
            lineNumbers: 'on',
            minimap: { enabled: false },
            folding: true,
            bracketPairColorization: { enabled: true },
            matchBrackets: 'always',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              verticalHasArrows: false,
              horizontalHasArrows: false
            },
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
}
