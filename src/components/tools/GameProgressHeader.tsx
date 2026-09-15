import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Coins, 
  Zap, 
  Crown,
  Flame,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressHeaderProps {
  userStats: {
    totalTools: number;
    completedTools: number;
    currentStreak: number;
    totalTXC: number;
    userLevel: number;
    nextLevelProgress: number;
  };
  userName: string;
  currentPage: number;
  totalPages: number;
  unlockedToolsCount: number;
}

export const GameProgressHeader: React.FC<GameProgressHeaderProps> = ({
  userStats,
  userName,
  unlockedToolsCount
}) => {
  const { 
    totalTools, 
    completedTools, 
    currentStreak, 
    totalTXC, 
    userLevel, 
    nextLevelProgress 
  } = userStats;

  const masteryPercent = totalTools > 0 ? Math.round((completedTools / totalTools) * 100) : 0;

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { icon: Crown, title: 'Master', color: 'from-amber-500 to-yellow-400 text-amber-950' };
    if (level >= 5) return { icon: Star, title: 'Expert', color: 'from-purple-500 to-indigo-500 text-white' };
    if (level >= 2) return { icon: Target, title: 'Advanced', color: 'from-blue-500 to-cyan-400 text-white' };
    return { icon: Zap, title: 'Beginner', color: 'from-indigo-600 to-blue-500 text-white' };
  };

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="mb-5 space-y-4">
      {/* Compact Apple-style Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold">{userName}</span>
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-semibold rounded-full px-2 py-0.5 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-500" />
              Pro Toolkit Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-normal">
            Your personal AI career acceleration toolkit. Level up skills, build verified proof, and land top opportunities.
          </p>
        </div>
      </div>

      {/* Sleek Compact 4-Card Progress Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Card 1: Level */}
        <div className="rounded-2xl p-3.5 transition-all duration-200 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-xs", levelBadge.color)}>
                <levelBadge.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Level {userLevel}</p>
                <p className="text-[10px] text-slate-400 font-medium">{levelBadge.title}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(nextLevelProgress)}%</span>
          </div>
          <Progress value={nextLevelProgress} className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Card 2: Mastery */}
        <div className="rounded-2xl p-3.5 transition-all duration-200 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xs text-white">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{completedTools}/{totalTools} <span className="text-[10px] font-normal text-slate-400">Tools</span></p>
                <p className="text-[10px] text-slate-400 font-medium">{unlockedToolsCount} available</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{masteryPercent}%</span>
          </div>
          <Progress value={masteryPercent} className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Card 3: Daily Streak */}
        <div className="rounded-2xl p-3.5 transition-all duration-200 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xs text-white">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentStreak} Day Streak</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  {currentStreak > 0 ? '🔥 Streak Active!' : 'Run a tool today!'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2 py-0 border-amber-200 text-amber-600 bg-amber-50/50">
              Active
            </Badge>
          </div>
        </div>

        {/* Card 4: Tokens */}
        <div className="rounded-2xl p-3.5 transition-all duration-200 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{totalTXC.toLocaleString()} <span className="text-violet-600 font-extrabold text-[11px]">TXC</span></p>
                <p className="text-[10px] text-slate-400 font-medium">Earn on completions</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2 py-0 border-violet-200 text-violet-600 bg-violet-50/50">
              Tokens
            </Badge>
          </div>
        </div>

      </div>
    </div>
  );
};