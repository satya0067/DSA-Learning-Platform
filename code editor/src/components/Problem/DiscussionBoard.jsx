import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MessageSquare, ThumbsUp, Send, UserCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DiscussionBoard() {
  const { activeProblem, discussions, addComment } = useStore();
  const [newComment, setNewComment] = useState('');

  const comments = discussions[activeProblem.id] || [];

  const handlePost = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-6 pb-6 pr-1">
      <div>
        <h2 className="text-lg font-bold text-white">Discussion Board</h2>
        <p className="text-xs text-gray-400 mt-1">Share approaches, optimize logic blocks, and debug together.</p>
      </div>

      {/* Write Comment Form */}
      <form onSubmit={handlePost} className="space-y-2 bg-[#1a1a2e]/30 border border-[#2e3b5e]/40 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 select-none mb-1">
          <MessageSquare size={14} className="text-blue-400" />
          <span>JOIN THE CONVERSATION (Markdown Enabled)</span>
        </div>
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="e.g. `const map = new Map();` ... using Map reduces the time complexity to O(N)."
          className="w-full bg-[#1a1a2e] text-white text-xs placeholder-gray-600 rounded-xl p-3 border border-[#2e3b5e] focus:outline-none focus:border-blue-500 font-medium transition-colors resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-bold">Use backticks (`) for code blocks.</span>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
          >
            <Send size={12} />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-semibold select-none">
            Be the first to share your thoughts on this problem!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start space-x-3.5 p-4 rounded-xl border border-[#2e3b5e]/25 bg-[#1a1a2e]/10 hover:border-[#2e3b5e]/40 transition-colors"
            >
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <UserCircle2 size={32} className="text-gray-500" />
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">{comment.author}</span>
                  <span className="text-gray-500 font-bold">{comment.date}</span>
                </div>
                
                {/* Markdown parsing inside comments */}
                <div className="text-xs text-gray-300 leading-relaxed break-words font-medium comment-markdown-body">
                  <ReactMarkdown>{comment.content}</ReactMarkdown>
                </div>

                {/* Like Button */}
                <div className="flex items-center space-x-3.5 pt-2 text-[10px] text-gray-500 font-bold select-none">
                  <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors cursor-pointer group">
                    <ThumbsUp size={11} className="group-hover:scale-110 transition-transform" />
                    <span>{comment.likes} Likes</span>
                  </button>
                  <span>Reply</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
