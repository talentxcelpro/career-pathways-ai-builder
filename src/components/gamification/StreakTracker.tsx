import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { 
  Flame, 
  Calendar, 
  Target, 
  Trophy, 
  TrendingUp,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

export const StreakTracker: React.FC = () => {
  const { userStreaks } = useGamification();

  const streakTypes = [
    {
      id: 'login',
      title: 'Login Streak',
      description: 'Consecutive days logged in',
      icon: Calendar,
      current: userStreaks?.current_login_streak || 0,
      longest: userStreaks?.longest_login_streak || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      target: 30,
      rewards: [
        { milestone: 7, reward: '100 TXC' },
        { milestone: 14, reward: '250 TXC' },
        { milestone: 30, reward: '500 TXC + Badge' }
      ]
    },
    {
      id: 'application',
      title: 'Application Streak',
      description: 'Daily job applications',
      icon: Target,
      current: userStreaks?.current_application_streak || 0,
      longest: userStreaks?.longest_application_streak || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      target: 14,
      rewards: [
        { milestone: 3, reward: '75 TXC' },
        { milestone: 7, reward: '200 TXC' },
        { milestone: 14, reward: '400 TXC + Badge' }
      ]
    }
  ];

  const getStreakLevel = (current: number, target: number) => {
    if (current >= target) return 'legendary';
    if (current >= target * 0.7) return 'epic';
    if (current >= target * 0.4) return 'rare';
    return 'common';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Streak Overview */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            Streak Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {Math.max(userStreaks?.current_login_streak || 0, userStreaks?.current_application_streak || 0)}
              </div>
              <div className="text-sm text-orange-600">Best Current Streak</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.max(userStreaks?.longest_login_streak || 0, userStreaks?.longest_application_streak || 0)}
              </div>
              <div className="text-sm text-purple-600">Longest Streak Ever</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700">
                {((userStreaks?.current_login_streak || 0) + (userStreaks?.current_application_streak || 0)) * 25}
              </div>
              <div className="text-sm text-green-600">TXC from Streaks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {streakTypes.map((streak) => {
          const Icon = streak.icon;
          const progress = (streak.current / streak.target) * 100;
          const level = getStreakLevel(streak.current, streak.target);
          const levelColor = getLevelColor(level);
          
          return (
            <Card key={streak.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${levelColor}`}></div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${streak.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{streak.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{streak.description}</p>
                    </div>
                  </div>
                  <Badge className={`bg-gradient-to-r ${levelColor} text-white capitalize`}>
                    {level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Current Progress */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className={`h-6 w-6 ${streak.color}`} />
                    <span className={`text-3xl font-bold ${streak.color}`}>
                      {streak.current}
                    </span>
                    <span className="text-lg text-muted-foreground">days</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Personal best: {streak.longest} days
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {streak.target} days</span>
                    <span>{Math.min(progress, 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                {/* Upcoming Rewards */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Streak Rewards</h4>
                  {streak.rewards.map((reward, index) => {
                    const isEarned = streak.current >= reward.milestone;
                    const isNext = !isEarned && (index === 0 || streak.current >= streak.rewards[index - 1].milestone);
                    
                    return (
                      <div key={reward.milestone} className={`
                        flex items-center justify-between p-3 rounded-lg border
                        ${isEarned ? 'bg-green-50 border-green-200' : 
                          isNext ? 'bg-blue-50 border-blue-200' : 
                          'bg-gray-50 border-gray-200'}
                      `}>
                        <div className="flex items-center gap-3">
                          {isEarned ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isNext ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <div>
                            <div className={`font-medium ${
                              isEarned ? 'text-green-700' : 
                              isNext ? 'text-blue-700' : 
                              'text-gray-600'
                            }`}>
                              {reward.milestone} Day Streak
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reward.reward}
                            </div>
                          </div>
                        </div>
                        {isNext && (
                          <Badge variant="outline" className="text-xs">
                            {reward.milestone - streak.current} days left
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Streak Tips */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">Streak Tips</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {streak.id === 'login' ? (
                      <>
                        <li>• Set daily reminders to maintain your streak</li>
                        <li>• Log in even for just a few minutes</li>
                        <li>• Use mobile app for easy access</li>
                      </>
                    ) : (
                      <>
                        <li>• Apply to 1-3 jobs daily for best results</li>
                        <li>• Save interesting jobs for quick applications</li>
                        <li>• Use AI tools to speed up applications</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Streak Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Streak Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">7-Day Login</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Log in every day this week
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500">+200 TXC</Badge>
                <span className="text-sm text-blue-600">3/7 days</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium">5-Day Applications</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Apply to jobs 5 days in a row
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500">+300 TXC</Badge>
                <span className="text-sm text-green-600">2/5 days</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Streak Combo</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Maintain both streaks for 3 days
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500">+500 TXC</Badge>
                <span className="text-sm text-purple-600">1/3 days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};