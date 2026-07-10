import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ChevronLeft, ChevronRight, Star, Play, CheckCircle, Search, Hash, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav() {
  const {
    problems,
    currentProblemIndex,
    activeProblem,
    favorites,
    toggleFavorite,
    prevProblem,
    nextProblem,
    setProblem,
    runCode,
    submitCode,
    runOutput,
    submissionResult
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  const isFavorite = favorites.includes(activeProblem.id);

  // Extract all unique categories/topics
  const categories = useMemo(() => {
    const cats = new Set();
    problems.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [problems]);

  // Filter problems for search list
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id) === searchQuery;
      const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      const matchCat = topicFilter === 'All' || p.category === topicFilter;
      return matchQuery && matchDiff && matchCat;
    }).slice(0, 50); // Limit to 50 for rendering speed
  }, [problems, searchQuery, difficultyFilter, topicFilter]);

  const difficultyColors = {
    Easy: '#00b8a3',
    Medium: '#ffc01e',
    Hard: '#ff375f'
  };

  const getDifficultyColor = (diff) => difficultyColors[diff] || '#ffffff';

  return (
    <div className="h-16 bg-[#16213e] border-b border-[#2e3b5e] flex items-center justify-between px-6 select-none relative z-50">
      
      {/* Left: Problem Selection & Pagination */}
      <div className="flex items-center space-x-4">
        {/* Logo / Platform Name */}
        <div className="flex items-center space-x-2 text-xl font-bold tracking-wider text-white">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 px-2.5 py-1 rounded-xl text-sm font-black shadow-md border border-indigo-500/20">STRUCT</span>
          <span className="text-gray-400 font-medium text-sm">LEARN</span>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-[1px] bg-gray-600 hidden sm:block"></div>

        {/* Problem Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevProblem}
            disabled={currentProblemIndex === 0}
            className="p-1.5 rounded-lg bg-[#1a1a2e] text-gray-400 hover:text-white disabled:opacity-40 hover:bg-[#202d4f] transition-all"
            title="Previous Problem"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] hover:bg-[#202d4f] border border-[#2e3b5e]/40 hover:border-[#2e3b5e] transition-all text-sm group"
          >
            <span className="text-gray-300 font-semibold font-mono text-sm mr-1">#{activeProblem.id}</span>
            <span className="text-white font-medium max-w-[120px] sm:max-w-[200px] truncate">{activeProblem.title}</span>
            <Search size={14} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
          </button>

          <button
            onClick={nextProblem}
            disabled={currentProblemIndex === problems.length - 1}
            className="p-1.5 rounded-lg bg-[#1a1a2e] text-gray-400 hover:text-white disabled:opacity-40 hover:bg-[#202d4f] transition-all"
            title="Next Problem"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Difficulty Badge */}
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: getDifficultyColor(activeProblem.difficulty) + '15',
            color: getDifficultyColor(activeProblem.difficulty),
            border: `1px solid ${getDifficultyColor(activeProblem.difficulty)}30`
          }}
        >
          {activeProblem.difficulty}
        </span>

        {/* Favorite Star */}
        <button
          onClick={toggleFavorite}
          className="p-1.5 rounded-lg hover:bg-[#202d4f] transition-colors group"
        >
          <Star
            size={18}
            className={`transition-colors duration-200 ${isFavorite ? 'fill-[#ffc01e] text-[#ffc01e]' : 'text-gray-400 group-hover:text-[#ffc01e]'}`}
          />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={runCode}
          disabled={runOutput.status === 'loading'}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-gray-300 bg-[#1a1a2e] hover:bg-[#202d4f] border border-[#2e3b5e] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Play size={14} className="fill-current text-gray-400" />
          <span>{runOutput.status === 'loading' ? 'Running...' : 'Run'}</span>
        </button>

        <button
          onClick={submitCode}
          disabled={submissionResult?.status === 'loading'}
          className="flex items-center space-x-1.5 px-5 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-950/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer border border-emerald-400/20"
        >
          <CheckCircle size={14} />
          <span>{submissionResult?.status === 'loading' ? 'Submitting...' : 'Submit'}</span>
        </button>
      </div>

      {/* Problem Search Drawer Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#16213e] border border-[#2e3b5e] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#2e3b5e] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <BookOpen size={18} className="text-blue-400" />
                  <span>Problem Set Explorer ({problems.length} problems)</span>
                </h3>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-white bg-[#1a1a2e] px-2.5 py-1 rounded-lg text-xs border border-[#2e3b5e] transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Search and Filters */}
              <div className="p-4 bg-[#1a1a2e]/50 border-b border-[#2e3b5e] flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or title..."
                    className="w-full pl-10 pr-4 py-1.5 bg-[#1a1a2e] text-white placeholder-gray-500 rounded-xl border border-[#2e3b5e] focus:outline-none focus:border-blue-500 text-sm font-medium transition-colors"
                  />
                </div>
                
                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-[#1a1a2e] text-white border border-[#2e3b5e] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {/* Topic Filter */}
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="bg-[#1a1a2e] text-white border border-[#2e3b5e] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredProblems.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No problems found matching filters.
                  </div>
                ) : (
                  filteredProblems.map((prob) => {
                    const isFav = favorites.includes(prob.id);
                    return (
                      <button
                        key={prob.id}
                        onClick={() => {
                          setProblem(prob.id);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#202d4f]/60 text-left transition-colors ${activeProblem.id === prob.id ? 'bg-[#202d4f]' : 'bg-transparent'}`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <span className="font-mono text-sm text-gray-500 font-semibold w-10">#{prob.id}</span>
                          <span className="font-medium text-white truncate">{prob.title}</span>
                          <span className="text-xs text-gray-400 bg-[#1a1a2e] px-2 py-0.5 rounded-md border border-[#2e3b5e]/40">{prob.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 pl-3">
                          <span
                            className="text-xs font-semibold w-14 text-right"
                            style={{ color: getDifficultyColor(prob.difficulty) }}
                          >
                            {prob.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 w-16 text-right hidden sm:inline">{prob.acceptanceRate}</span>
                          {isFav && <Star size={14} className="fill-[#ffc01e] text-[#ffc01e]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#2e3b5e] bg-[#1a1a2e]/30 text-center text-xs text-gray-500">
                Showing top {filteredProblems.length} results. Use specific query strings to search exact ID titles.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
