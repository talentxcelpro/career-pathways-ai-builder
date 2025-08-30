import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp,
  Medal,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react';

export const GamificationWidget: React.FC = () => {
  const { stats, isLoading, updateProfileCompletion } = useGamification();

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const levelProgress = (stats.currentLevelPoints / stats.nextLevelPoints) * 100;

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card className="shadow-elegant border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Career Progress
            </span>
            <Badge variant="secondary" className="text-xs">
              Level {stats.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.currentLevelPoints} points</span>
              <span>{stats.nextLevelPoints} to next level</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-subtle rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary">{stats.totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary">{stats.achievements.length}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Profile Completion</span>
              <span className="text-xs text-muted-foreground">{stats.profileCompletion}%</span>
            </div>
            <Progress value={stats.profileCompletion} className="h-2" />
            {stats.profileCompletion < 100 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={updateProfileCompletion}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streaks Card */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-orange-500" />
            Activity Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-sm font-bold text-orange-500">{stats.streaks.learning}</div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-blue-500">{stats.streaks.applications}</div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-green-500">{stats.streaks.profile_updates}</div>
              <div className="text-xs text-muted-foreground">Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.achievements.slice(0, 3).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 bg-gradient-subtle rounded-lg"
                >
                  <Medal className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">
                      {achievement.achievement_title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{achievement.points_awarded} points
                    </div>
                  </div>
                </div>
              ))}
              {stats.achievements.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Achievements
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            Boost Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <TrendingUp className="h-3 w-3 mr-2" />
              Apply to 3 jobs (+100 pts)
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Star className="h-3 w-3 mr-2" />
              Get 5 profile views (+50 pts)
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <CheckCircle className="h-3 w-3 mr-2" />
              Complete a course (+200 pts)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};