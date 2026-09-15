import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Award, 
  Target,
  TrendingUp,
  Crown,
  Medal,
  Sparkles
} from 'lucide-react';

interface GamificationDashboardProps {
  userStats: {
    level: number;
    xp: number;
    xpToNext: number;
    currentStreak: number;
    longestStreak: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      unlockedAt?: Date;
    }>;
    weeklyGoal: {
      target: number;
      current: number;
    };
    leaderboardRank: number;
  };
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userStats }) => {
  const getBadgeIcon = (icon: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      trophy: Trophy,
      star: Star,
      crown: Crown,
      medal: Medal,
      award: Award,
      sparkles: Sparkles,
      target: Target
    };
    return icons[icon] || Award;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const xpProgress = (userStats.xp / (userStats.xp + userStats.xpToNext)) * 100;
  const weeklyProgress = (userStats.weeklyGoal.current / userStats.weeklyGoal.target) * 100;

  return (
    <div className="space-y-6">
      {/* Level & XP Progress */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Level {userStats.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>XP Progress</span>
                <span>{userStats.xp} / {userStats.xp + userStats.xpToNext} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userStats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{userStats.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Weekly Learning Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress this week</span>
              <span>{userStats.weeklyGoal.current} / {userStats.weeklyGoal.target} hours</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            {weeklyProgress >= 100 && (
              <Badge className="bg-green-100 text-green-800">
                <Trophy className="h-3 w-3 mr-1" />
                Goal Achieved!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">#{userStats.leaderboardRank}</div>
              <div className="text-sm text-muted-foreground">Your Rank</div>
            </div>
            <Button variant="outline" size="sm">
              View Full Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Badges Collection ({userStats.badges.filter(b => b.unlockedAt).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userStats.badges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.icon);
              const isUnlocked = !!badge.unlockedAt;
              
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isUnlocked 
                      ? `${getRarityColor(badge.rarity)} hover:scale-105` 
                      : 'bg-muted border-muted opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent 
                      className={`h-8 w-8 mx-auto mb-2 ${
                        isUnlocked ? 'text-current' : 'text-muted-foreground'
                      }`} 
                    />
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {badge.description}
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};