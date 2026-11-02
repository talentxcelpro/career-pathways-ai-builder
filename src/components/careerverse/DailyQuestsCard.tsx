import React from 'react';
import { Target, Clock, CheckCircle2, Circle, Flame, Terminal, Zap, Sparkles } from 'lucide-react';
import { CareerQuest } from '@/services/careerverse/careerQuestService';

interface DailyQuestsProps {
  quests: CareerQuest[];
  streak: number;
  onSelectQuest: (quest: CareerQuest) => void;
  onLaunchCodeArena?: () => void;
  onLaunchLogicDuel?: () => void;
}

export const DailyQuestsCard: React.FC<DailyQuestsProps> = ({
  quests,
  streak,
  onSelectQuest,
  onLaunchCodeArena,
  onLaunchLogicDuel,
}) => {
  const dailyQuests = quests.filter(q => q.category === 'daily').slice(0, 4);

  const days = [
    { label: 'Mon', active: true },
    { label: 'Tue', active: true },
    { label: 'Wed', active: true },
    { label: 'Fri', active: true },
    { label: 'Sat', active: true },
    { label: 'Sun', active: false },
  ];

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl">
      {/* Background Glow */}
      <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#36D9F5]/10 blur-2xl pointer-events-none" />

      <div className="z-10">
        {/* Header with Title and Countdown */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#36D9F5]/15 border border-[#36D9F5]/30 flex items-center justify-center text-[#36D9F5]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Daily Quests</h3>
              <p className="text-[11px] text-slate-400">Personalized Skill Missions</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-[#071329] px-2.5 py-1 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-[#36D9F5]" />
            <span>14h 26m left</span>
          </div>
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-2.5">
          {dailyQuests.map((quest) => {
            const isCompleted = quest.user_progress?.status === 'completed' || quest.user_progress?.status === 'claimed';
            return (
              <button
                key={quest.id}
                onClick={() => onSelectQuest(quest)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isCompleted
                    ? 'bg-[#071329]/60 border-[#20D994]/30 text-slate-300'
                    : 'bg-[#071329] border-white/5 hover:border-[#36D9F5]/40 text-white hover:bg-[#071329]/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#20D994] flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {quest.title}
                  </span>
                </div>

                <span className="text-xs font-black text-[#20D994] bg-[#20D994]/10 px-2 py-0.5 rounded-md flex-shrink-0 border border-[#20D994]/20">
                  +{quest.xp_reward} XP
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Playable Arena Shortcut Buttons */}
        {(onLaunchCodeArena || onLaunchLogicDuel) && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
            {onLaunchCodeArena && (
              <button
                onClick={onLaunchCodeArena}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#7047F5]/20 to-[#278DFF]/20 hover:from-[#7047F5]/30 hover:to-[#278DFF]/30 border border-[#36D9F5]/30 text-[11px] font-bold text-white transition-all shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5 text-[#36D9F5]" />
                <span>Code Arena</span>
              </button>
            )}

            {onLaunchLogicDuel && (
              <button
                onClick={onLaunchLogicDuel}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#FFCA55]/20 to-[#FFA726]/20 hover:from-[#FFCA55]/30 hover:to-[#FFA726]/30 border border-[#FFCA55]/30 text-[11px] font-bold text-white transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFCA55]" />
                <span>60s Logic Duel</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 7-Day Streak Panel */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFCA55]/15 border border-[#FFCA55]/30 flex items-center justify-center text-[#FFCA55]">
            <Flame className="w-4 h-4 fill-[#FFCA55] text-[#FFCA55]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{streak || 7} Day Streak</span>
            <span className="text-[10px] text-slate-400">Keep it going!</span>
          </div>
        </div>

        {/* Weekday status dots */}
        <div className="flex items-center gap-1.5">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  day.active
                    ? 'bg-[#20D994] text-slate-950'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {day.active ? '✓' : ''}
              </div>
              <span className="text-[9px] text-slate-400">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
