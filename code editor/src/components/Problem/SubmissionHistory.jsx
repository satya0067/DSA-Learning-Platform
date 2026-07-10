import React from 'react';
import { useStore } from '../../store/useStore';
import { CalendarClock, Award, Ban, HelpCircle } from 'lucide-react';

export default function SubmissionHistory() {
  const { submissionsHistory, activeProblem } = useStore();

  const history = submissionsHistory[activeProblem.id] || [];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Wrong Answer':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Compilation Error':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4 pb-6 pr-1">
      <div>
        <h2 className="text-lg font-bold text-white">Submissions Log</h2>
        <p className="text-xs text-gray-400 mt-1">Chronological history of code uploads and compiler evaluations.</p>
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-[#2e3b5e]/30 rounded-2xl bg-[#1a1a2e]/20 text-center space-y-3">
          <CalendarClock size={40} className="text-gray-600" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-300">No Submissions Yet</h3>
            <p className="text-xs text-gray-500 max-w-[280px]">Your compilation attempts will be tracked and stored here once you submit.</p>
          </div>
        </div>
      ) : (
        /* History Table */
        <div className="overflow-hidden border border-[#2e3b5e]/40 rounded-xl bg-[#1a1a2e]/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#131a2c] text-gray-400 font-bold border-b border-[#2e3b5e]/60">
                <th className="p-3">Status</th>
                <th className="p-3">Language</th>
                <th className="p-3">Runtime</th>
                <th className="p-3">Memory</th>
                <th className="p-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3b5e]/30">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-[#202d4f]/15 transition-colors font-medium">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-300 font-semibold uppercase">{item.language}</td>
                  <td className="p-3 text-gray-300 font-mono">{item.runtime}</td>
                  <td className="p-3 text-gray-300 font-mono">{item.memory}</td>
                  <td className="p-3 text-gray-500 text-right">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
