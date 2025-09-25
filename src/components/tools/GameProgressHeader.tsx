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
    <div className="mb-8 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground">
          Continue your journey to career mastery
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level Progress */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <levelBadge.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Level {userLevel}</p>
                  <p className="text-xs text-muted-foreground">{levelBadge.title}</p>
                </div>
              </div>
              <Badge className={cn("border text-xs", levelBadge.color)}>
                {xpToNextLevel} XP to next
              </Badge>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Tools Completion */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{completedTools}/{unlockedToolsCount}</p>
                <p className="text-xs text-muted-foreground">Tools Mastered</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(completionRate)}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Keep it going! 🔥
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* TXC Balance */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Coins className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{totalTXC.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">TXC Balance</p>
              </div>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" className="text-xs h-6">
                Earn More <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Indicator */}
      <Card className="border-border/50 bg-gradient-to-r from-accent/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-semibold">Tools Collection</span>
              </div>
              <Badge variant="outline">
                Page {currentPage} of {totalPages}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                {unlockedToolsCount} Unlocked
              </Badge>
              <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                {totalTools - unlockedToolsCount} Locked
              </Badge>
            </div>
          </div>
          
          {currentPage > 1 && (
            <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-primary font-medium">
                🎉 Great progress! You've unlocked page {currentPage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};