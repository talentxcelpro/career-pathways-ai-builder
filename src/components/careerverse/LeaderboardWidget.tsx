import React from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { LeaderboardEntry } from '@/services/careerverse/careerLeaderboardService';

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  currentScope: 'college' | 'react' | 'overall';
  onChangeScope: (scope: 'college' | 'react' | 'overall') => void;
  onOpenFullLeaderboard?: () => void;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  entries,
  currentScope,
  onChangeScope,
  onOpenFullLeaderboard,
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFCA55]/20 flex items-center justify-center text-[#FFCA55]">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Leaderboard</h3>
        </div>
      </div>

      {/* Scope Filter Tabs matching reference screenshot */}
      <div className="flex items-center gap-1 bg-[#071329] p-1 rounded-xl border border-white/5">
        <button
          onClick={() => onChangeScope('college')}
          className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition-all ${
            currentScope === 'college'
              ? 'bg-[#7047F5] text-white shadow-[0_0_10px_rgba(112,71,245,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My College
        </button>

        <button
          onClick={() => onChangeScope('react')}
          className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition-all ${
            currentScope === 'react'
              ? 'bg-[#7047F5] text-white shadow-[0_0_10px_rgba(112,71,245,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          React
        </button>

        <button
          onClick={() => onChangeScope('overall')}
          className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition-all ${
            currentScope === 'overall'
              ? 'bg-[#7047F5] text-white shadow-[0_0_10px_rgba(112,71,245,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overall
        </button>
      </div>

      {/* Player List matching reference screenshot */}
      <div className="space-y-2">
        {entries.slice(0, 5).map((entry) => {
          const isUser = entry.is_current_user;

          return (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                isUser
                  ? 'bg-gradient-to-r from-[#7047F5]/30 to-[#A34EFF]/20 border border-[#7047F5] shadow-lg shadow-[#7047F5]/25'
                  : 'bg-[#071329]/50 border border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Rank number or Crown */}
                <div className="w-5 text-center text-xs font-black">
                  {entry.rank === 1 ? (
                    <span className="text-[#FFCA55]">👑</span>
                  ) : (
                    <span className={isUser ? 'text-[#36D9F5]' : 'text-slate-400'}>{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={entry.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <span className={`text-xs font-bold truncate max-w-[110px] ${isUser ? 'text-white' : 'text-slate-200'}`}>
                  {entry.name}
                </span>
              </div>

              {/* XP */}
              <span className={`text-xs font-black ${isUser ? 'text-[#36D9F5]' : 'text-slate-300'}`}>
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          );
        })}
      </div>

      {/* View Full Leaderboard Footer */}
      <button
        onClick={onOpenFullLeaderboard}
        className="w-full text-center text-xs font-bold text-[#36D9F5] hover:underline flex items-center justify-center gap-1 pt-1"
      >
        <span>View Full Leaderboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
