import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Sparkles,
  Layers
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
    if (level >= 10) return { icon: Crown, title: 'Master', color: 'from-amber-500 to-yellow-400 text-amber-950', ring: 'ring-amber-400/30' };
    if (level >= 5) return { icon: Star, title: 'Expert', color: 'from-purple-500 to-indigo-500 text-white', ring: 'ring-purple-500/30' };
    if (level >= 2) return { icon: Target, title: 'Advanced', color: 'from-blue-500 to-cyan-400 text-white', ring: 'ring-blue-500/30' };
    return { icon: Zap, title: 'Beginner', color: 'from-sky-500 to-indigo-500 text-white', ring: 'ring-sky-500/30' };
  };

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="mb-8 space-y-6">
      {/* Apple-style Hero Banner */}
      <div className="relative text-center space-y-3 px-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/15 backdrop-blur-xl shadow-sm text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>TalentXcel Career OS Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-500 dark:text-slate-400 font-normal">26 Pro Tools Active</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">{userName}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
          Your personal AI career acceleration toolkit. Level up skills, build verified proof, and land top opportunities.
        </p>
      </div>

      {/* Apple iOS Widget-Style 4-Card Hero Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-0">
        
        {/* Card 1: Level & XP */}
        <div className="group relative rounded-3xl p-5 transition-all duration-300 bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", levelBadge.color)}>
              <levelBadge.icon className="w-5 h-5 text-white" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
              Level {userLevel}
            </Badge>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progression</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(nextLevelProgress)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              {levelBadge.title} Status
            </p>
          </div>
        </div>

        {/* Card 2: Completed Tools Mastery */}
        <div className="group relative rounded-3xl p-5 transition-all duration-300 bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300">
              {masteryPercent}% Mastery
            </Badge>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{completedTools}<span className="text-sm font-normal text-slate-400">/{totalTools}</span></span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
            </div>
            <Progress value={masteryPercent} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              {unlockedToolsCount} tools available to run
            </p>
          </div>
        </div>

        {/* Card 3: Daily Streak */}
        <div className="group relative rounded-3xl p-5 transition-all duration-300 bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md text-white">
              <Flame className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300">
              Active
            </Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{currentStreak}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Day Streak</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">
              {currentStreak > 0 ? '🔥 On Fire! Keep it up!' : '⚡ Run a tool today to start!'}
            </p>
          </div>
        </div>

        {/* Card 4: TXC Token Balance */}
        <div className="group relative rounded-3xl p-5 transition-all duration-300 bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md text-white">
              <Coins className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-violet-200 dark:border-violet-800 bg-violet-50/80 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300">
              Tokens
            </Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalTXC.toLocaleString()}</span>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">TXC</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Earn tokens on every completed tool
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};