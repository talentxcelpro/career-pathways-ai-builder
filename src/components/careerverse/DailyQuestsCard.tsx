import React from 'react';
import { Target, Clock, Check, Flame } from 'lucide-react';
import { CareerQuest } from '@/services/careerverse/careerQuestService';

interface DailyQuestsCardProps {
  quests: CareerQuest[];
  streakCount?: number;
  onOpenQuest?: (quest: CareerQuest) => void;
  onQuickComplete?: (quest: CareerQuest) => void;
}

export const DailyQuestsCard: React.FC<DailyQuestsCardProps> = ({
  quests,
  streakCount = 7,
  onOpenQuest,
  onQuickComplete,
}) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header with Title and Countdown Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#36D9F5]">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Daily Quests</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-[#071329] px-2.5 py-1 rounded-full border border-white/5">
          <Clock className="w-3.5 h-3.5 text-[#36D9F5]" />
          <span>14h 26m left</span>
        </div>
      </div>

      {/* Quest Checklist Items matching reference screenshot */}
      <div className="space-y-2.5">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => onOpenQuest?.(quest)}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-[#071329]/60 hover:bg-[#071329] border border-white/5 hover:border-[#7047F5]/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickComplete?.(quest);
                }}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  quest.completed
                    ? 'bg-[#20D994] text-slate-950 shadow-[0_0_8px_rgba(32,217,148,0.5)]'
                    : 'border border-slate-600 hover:border-[#36D9F5]'
                }`}
              >
                {quest.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <span
                className={`text-xs font-semibold transition-colors ${
                  quest.completed ? 'text-slate-300 line-through' : 'text-white group-hover:text-[#36D9F5]'
                }`}
              >
                {quest.title}
              </span>
            </div>

            <span className="text-xs font-bold text-[#20D994] shrink-0">
              +{quest.xp_reward} XP
            </span>
          </div>
        ))}
      </div>

      {/* 7-Day Streak Footer matching reference screenshot */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
          <span>{streakCount} Day Streak</span>
        </div>

        {/* Days Mon-Sun with green circles */}
        <div className="flex items-center gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-[#20D994] flex items-center justify-center text-slate-950 shadow-[0_0_6px_rgba(32,217,148,0.4)]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
