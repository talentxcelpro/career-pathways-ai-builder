import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Award, Target, Flame, Users, TrendingUp } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

const GamificationDashboard: React.FC = () => {
  const {
    achievements,
    availableAchievements,
    userStreaks,
    leaderboards,
    isLoading,
    getAchievementProgress,
    getRecentAchievements,
    getTotalTXCFromAchievements
  } = useGamification();

  const recentAchievements = getRecentAchievements();
  const totalTXCEarned = getTotalTXCFromAchievements();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{userStreaks?.current_login_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Login Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{userStreaks?.current_application_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Application Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{formatTXC(totalTXCEarned)}</p>
                <p className="text-sm text-muted-foreground">From Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAchievements.length > 0 ? (
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{achievement.achievement_name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+{achievement.txc_reward} TXC</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet. Start completing activities to earn your first achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Towards Next Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableAchievements
                .filter(def => !achievements.find(a => a.achievement_type === def.achievement_type))
                .slice(0, 5)
                .map((achievement) => {
                  const progress = getAchievementProgress(achievement.achievement_type);
                  return (
                    <div key={achievement.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="outline">+{achievement.txc_reward} TXC</Badge>
                      </div>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% complete</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard - Top TXC Earners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboards.length > 0 ? (
              <div className="space-y-2">
                {leaderboards.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">User #{entry.user_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{entry.leaderboard_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.score.toLocaleString()} TXC</p>
                      <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Leaderboard coming soon! Keep earning TXC to climb the ranks.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamificationDashboard;