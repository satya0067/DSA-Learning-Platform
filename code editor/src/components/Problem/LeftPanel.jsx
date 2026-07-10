import React from 'react';
import { useStore } from '../../store/useStore';
import ProblemDescription from './ProblemDescription';
import SolutionView from './SolutionView';
import SubmissionHistory from './SubmissionHistory';
import DiscussionBoard from './DiscussionBoard';
import { BookText, Award, CalendarClock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeftPanel() {
  const { activeTab, setActiveTab } = useStore();

  const tabs = [
    { id: 'description', label: 'Description', icon: BookText },
    { id: 'solutions', label: 'Solutions', icon: Award },
    { id: 'submissions', label: 'Submissions', icon: CalendarClock },
    { id: 'discuss', label: 'Discuss', icon: MessageSquare }
  ];

  return (
    <div className="h-full flex flex-col bg-[#16213e] text-[#e2e8f0]">
      {/* Tabs list */}
      <div className="flex border-b border-[#2e3b5e] px-4 bg-[#131a2c]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 py-3 px-4 text-xs font-bold uppercase tracking-wider relative transition-colors ${isActive ? 'text-blue-400 font-extrabold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Icon size={14} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
              <span>{tab.label}</span>
              
              {/* Sliding highlight indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel contents with scale-fade animations */}
      <div className="flex-1 overflow-y-auto p-5 relative">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === 'description' && <ProblemDescription />}
          {activeTab === 'solutions' && <SolutionView />}
          {activeTab === 'submissions' && <SubmissionHistory />}
          {activeTab === 'discuss' && <DiscussionBoard />}
        </motion.div>
      </div>
    </div>
  );
}
