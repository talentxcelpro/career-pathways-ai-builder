import React from 'react';
import { Target, Clock, CheckCircle2, Circle, Flame, Terminal, Zap } from 'lucide-react';
import { CareerQuest } from '@/services/careerverse/careerQuestService';
import { gameAudio } from '@/utils/gameAudio';

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

  // Authentically compute 7-day activity checkmarks based on player streak
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const activeDaysCount = Math.min(streak, 7);

  const days = dayLabels.map((label, idx) => {
    const isPastOrToday = idx <= todayDayIndex;
    const isWithinStreak = (todayDayIndex - idx) < activeDaysCount && (todayDayIndex - idx) >= 0;
    return {
      label,
      active: streak > 0 && isPastOrToday && isWithinStreak,
    };
  });

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl h-full">
      {/* Background Glow */}
      <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#36D9F5]/10 blur-2xl pointer-events-none" />

      <div className="z-10 flex flex-col justify-between h-full">
        <div>
          {/* Header with Title and Countdown */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#36D9F5]/15 border border-[#36D9F5]/30 flex items-center justify-center text-[#36D9F5]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base sm:text-lg leading-tight">Daily Quests</h3>
                <p className="text-xs text-slate-300 font-medium">Personalized Skill Missions</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold bg-[#071329] px-2.5 py-1 rounded-lg border border-white/10">
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
                  onClick={() => {
                    gameAudio.playClick();
                    onSelectQuest(quest);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#071329]/60 border-[#20D994]/30 text-slate-300'
                      : 'bg-[#071329] border-white/5 hover:border-[#36D9F5]/40 text-white hover:bg-[#071329]/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#20D994] flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs sm:text-sm font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {quest.title}
                    </span>
                  </div>

                  <span className="text-xs font-black text-[#20D994] bg-[#20D994]/10 px-2.5 py-0.5 rounded-md flex-shrink-0 border border-[#20D994]/20">
                    +{quest.xp_reward} XP
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Playable Arena Shortcut Buttons */}
          {(onLaunchCodeArena || onLaunchLogicDuel) && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
              {onLaunchCodeArena && (
                <button
                  onClick={() => {
                    gameAudio.playClick();
                    onLaunchCodeArena();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#278DFF]/15 hover:bg-[#278DFF]/25 border border-[#278DFF]/40 text-white text-xs sm:text-sm font-bold transition-all shadow-md group cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-[#36D9F5] group-hover:scale-110 transition-transform" />
                  <span>Interactive Arena</span>
                </button>
              )}

              {onLaunchLogicDuel && (
                <button
                  onClick={() => {
                    gameAudio.playClick();
                    onLaunchLogicDuel();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#7047F5]/20 hover:bg-[#7047F5]/30 border border-[#7047F5]/40 text-white text-xs sm:text-sm font-bold transition-all shadow-md group cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#A34EFF] group-hover:scale-110 transition-transform" />
                  <span>Timed Duel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 7-Day Activity Streak Strip */}
        <div className="pt-4 border-t border-white/5 mt-3">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#FFCA55]" />
              <span>Streak Progress</span>
            </span>
            <span className="font-bold text-[#FFCA55]">
              {streak} Day{streak !== 1 ? 's' : ''} Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`py-1.5 rounded-lg text-center flex flex-col items-center justify-center transition-all ${
                  day.active
                    ? 'bg-[#20D994]/20 border border-[#20D994]/40 text-[#20D994] shadow-sm'
                    : 'bg-[#071329] border border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-bold leading-none">{day.label}</span>
                <span className="text-xs leading-none mt-1">
                  {day.active ? '●' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
