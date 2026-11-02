import React, { useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { LeaderboardPlayer } from '@/services/careerverse/careerLeaderboardService';

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  currentTab: 'college' | 'react' | 'overall';
  onTabChange: (tab: 'college' | 'react' | 'overall') => void;
  onViewFull: () => void;
}

export const LeaderboardWidget: React.FC<LeaderboardProps> = ({
  players,
  currentTab,
  onTabChange,
  onViewFull
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFCA55]/15 flex items-center justify-center text-[#FFCA55]">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Leaderboard</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#071329] p-1 rounded-xl border border-white/5">
        <button
          onClick={() => onTabChange('college')}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'college'
              ? 'bg-[#278DFF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My College
        </button>
        <button
          onClick={() => onTabChange('react')}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'react'
              ? 'bg-[#278DFF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          React
        </button>
        <button
          onClick={() => onTabChange('overall')}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'overall'
              ? 'bg-[#278DFF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overall
        </button>
      </div>

      {/* Ranked Players List */}
      <div className="flex flex-col gap-1.5">
        {players.slice(0, 5).map((player) => {
          const isCurrentUser = player.is_current_user;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-[#7047F5]/30 to-[#278DFF]/30 border-[#7047F5] shadow-lg shadow-[#7047F5]/20'
                  : 'bg-[#071329] border-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {/* Rank Number / Crown */}
                <span
                  className={`w-5 text-center text-xs font-black ${
                    player.rank === 1
                      ? 'text-[#FFCA55]'
                      : player.rank === 2
                      ? 'text-[#36D9F5]'
                      : player.rank === 3
                      ? 'text-[#FFA726]'
                      : 'text-slate-400'
                  }`}
                >
                  {player.rank === 1 ? '👑' : player.rank}
                </span>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-[#101E3B] border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.display_name} className="w-full h-full object-cover" />
                  ) : (
                    player.display_name.charAt(0)
                  )}
                </div>

                {/* Name */}
                <span className={`text-xs font-bold truncate ${isCurrentUser ? 'text-white' : 'text-slate-200'}`}>
                  {player.display_name}
                </span>
              </div>

              {/* XP Pill */}
              <span className="text-xs font-black text-white bg-white/5 px-2.5 py-1 rounded-md flex-shrink-0">
                {player.xp.toLocaleString()} XP
              </span>
            </div>
          );
        })}
      </div>

      {/* View Full Link */}
      <button
        onClick={onViewFull}
        className="w-full text-center text-xs font-bold text-[#36D9F5] hover:underline flex items-center justify-center gap-1 pt-1"
      >
        <span>View Full Leaderboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
