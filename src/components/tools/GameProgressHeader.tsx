import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Coins, 
  Zap, 
  Activity,
  Crown,
  Flame,
  ChevronRight
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
  currentPage,
  totalPages,
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

  const completionRate = totalTools > 0 ? (completedTools / totalTools) * 100 : 0;
  const xpToNextLevel = 1000 - (nextLevelProgress * 10); // Simplified calculation

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { icon: Crown, color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', title: 'Master' };
    if (level >= 5) return { icon: Star, color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', title: 'Expert' };
    if (level >= 2) return { icon: Target, color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', title: 'Advanced' };
    return { icon: Zap, color: 'bg-green-500/10 text-green-700 border-green-500/20', title: 'Beginner' };
  };

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
      {/* Apple-style welcome section */}
      <div className="text-center space-y-3 px-4">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md mx-auto">
          Continue building your career toolkit
        </p>
      </div>

      {/* Compact stats grid - mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4">
        {/* Level Progress - Apple card style */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <levelBadge.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">Level {userLevel}</p>
                  <p className="text-xs text-muted-foreground/80">{levelBadge.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={nextLevelProgress} className="h-2 bg-muted/30" />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(nextLevelProgress)}% to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Completion */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">{completedTools}/{unlockedToolsCount}</p>
                  <p className="text-xs text-muted-foreground/80">Completed</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={completionRate} className="h-2 bg-muted/30" />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(completionRate)}% mastery
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">{currentStreak}</p>
                  <p className="text-xs text-muted-foreground/80">Day Streak</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 border-orange-500/30 w-full justify-center">
                {currentStreak > 0 ? 'Keep it up! 🔥' : 'Start your streak!'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* TXC Balance */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">{totalTXC.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground/80">TXC Tokens</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8 w-full bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20">
                Earn More <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minimalist progress indicator */}
      <Card className="border-0 bg-gradient-to-r from-background/80 via-muted/20 to-background/80 shadow-lg backdrop-blur-xl mx-4">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Your Toolkit</h3>
                <p className="text-xs text-muted-foreground/80">Page {currentPage} of {totalPages}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                {unlockedToolsCount} Available
              </Badge>
              <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/30 text-xs">
                {totalTools - unlockedToolsCount} Locked
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};