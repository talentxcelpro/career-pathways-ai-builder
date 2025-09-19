import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Award, Target, Flame, Users, TrendingUp } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

const GamificationDashboard: React.FC = React.memo(() => {
  const gamificationData = useGamification();

  // Stable computations
  const {
    achievements = [],
    availableAchievements = [],
    userStreaks,
    leaderboards = [],
    isLoading
  } = gamificationData;

  const computedData = useMemo(() => ({
    recentAchievements: achievements.slice(0, 5),
    totalTXCEarned: achievements.reduce((total, achievement) => total + achievement.txc_reward, 0),
    availableToShow: availableAchievements
      .filter(def => !achievements.find(a => a.achievement_type === def.achievement_type))
      .slice(0, 5)
  }), [achievements, availableAchievements]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ contain: 'layout style' }}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="h-20 bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-primary">
                  {achievements.length}
                </p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
              <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-accent">
                  {userStreaks?.current_login_streak || 0}
                </p>
                <p className="text-xs text-muted-foreground">Login Streak</p>
              </div>
              <Flame className="h-5 w-5 text-accent flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-secondary">
                  {userStreaks?.current_application_streak || 0}
                </p>
                <p className="text-xs text-muted-foreground">App Streak</p>
              </div>
              <Target className="h-5 w-5 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-primary">
                  {formatTXC(computedData.totalTXCEarned)}
                </p>
                <p className="text-xs text-muted-foreground">TXC Earned</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Achievements */}
        <Card className="min-h-64">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {computedData.recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {computedData.recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{achievement.achievement_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">+{achievement.txc_reward}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Complete activities to earn achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Towards Next Achievements */}
        <Card className="min-h-64">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {computedData.availableToShow.map((achievement) => {
                const progress = gamificationData.getAchievementProgress?.(achievement.achievement_type) || 0;
                return (
                  <div key={achievement.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">+{achievement.txc_reward}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Progress value={progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="lg:col-span-2 min-h-48">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Top TXC Earners
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {leaderboards.length > 0 ? (
              <div className="space-y-2">
                {leaderboards.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">User #{entry.user_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{entry.leaderboard_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{entry.score.toLocaleString()} TXC</p>
                      <p className="text-xs text-muted-foreground">#{entry.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Leaderboard coming soon!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default GamificationDashboard;