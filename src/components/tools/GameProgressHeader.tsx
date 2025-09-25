import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, Zap, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressHeaderProps {
  userName?: string;
  totalTools: number;
  completedTools: number;
  currentStreak: number;
  totalTXC: number;
  userLevel: number;
  nextLevelProgress: number;
}

export const GameProgressHeader: React.FC<GameProgressHeaderProps> = ({
  userName = 'there',
  totalTools,
  completedTools,
  currentStreak,
  totalTXC,
  userLevel,
  nextLevelProgress
}) => {
  const progressPercentage = (completedTools / totalTools) * 100;

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { icon: Crown, color: 'bg-yellow-500', title: 'Master' };
    if (level >= 7) return { icon: Trophy, color: 'bg-purple-500', title: 'Expert' };
    if (level >= 4) return { icon: Star, color: 'bg-blue-500', title: 'Pro' };
    return { icon: Target, color: 'bg-green-500', title: 'Explorer' };
  };

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-accent/10" />
      
      <div className="relative p-8 rounded-3xl backdrop-blur-xl border border-border/50 bg-card/80">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {userName}! 🚀
            </h1>
            <p className="text-muted-foreground">
              Ready to level up your career with AI-powered tools?
            </p>
          </div>
          
          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-lg",
              levelBadge.color
            )}>
              <levelBadge.icon className="w-5 h-5" />
              <span>Level {userLevel}</span>
              <span className="text-xs opacity-90">{levelBadge.title}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{completedTools}</div>
                <div className="text-xs text-muted-foreground">Tools Completed</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {completedTools} of {totalTools}
            </div>
          </div>

          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-4 border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/20 rounded-lg">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-4 rounded-full",
                    i < currentStreak ? "bg-success" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-4 border border-warning/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalTXC}</div>
                <div className="text-xs text-muted-foreground">TXC Earned</div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Lifetime Total
            </Badge>
          </div>

          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{userLevel}</div>
                <div className="text-xs text-muted-foreground">Current Level</div>
              </div>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {nextLevelProgress}% to next level
            </div>
          </div>
        </div>

        {/* Achievement Notifications */}
        {currentStreak >= 7 && (
          <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-2xl p-4 border border-success/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="font-semibold text-success">Week Warrior!</div>
                <div className="text-sm text-muted-foreground">
                  You've maintained a 7-day streak. Bonus TXC earned!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Complete 3 tools on any page to unlock the next one
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {Math.round(progressPercentage)}% Complete
          </Badge>
        </div>
      </div>
    </div>
  );
};