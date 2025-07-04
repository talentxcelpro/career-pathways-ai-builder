import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Calendar, 
  Target, 
  Trophy, 
  TrendingUp,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_type: 'daily_login' | 'activity_completion' | 'goal_progress' | 'community_engagement';
  last_activity: string;
  next_milestone: number;
  streak_multiplier: number;
  is_active: boolean;
}

interface StreakCounterProps {
  streaks: StreakData[];
  compact?: boolean;
}

const STREAK_TYPES = {
  daily_login: {
    title: 'Daily Login',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Log in every day'
  },
  activity_completion: {
    title: 'Activity Streak',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Complete daily activities'
  },
  goal_progress: {
    title: 'Goal Progress',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Make progress on goals'
  },
  community_engagement: {
    title: 'Community Engagement',
    icon: Trophy,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Engage with communities'
  }
};

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

export const StreakCounter: React.FC<StreakCounterProps> = ({ 
  streaks, 
  compact = false 
}) => {
  const getStreakLevel = (streak: number) => {
    if (streak >= 365) return { level: 'Legendary', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    if (streak >= 100) return { level: 'Master', color: 'bg-purple-500' };
    if (streak >= 60) return { level: 'Expert', color: 'bg-blue-500' };
    if (streak >= 30) return { level: 'Advanced', color: 'bg-green-500' };
    if (streak >= 14) return { level: 'Intermediate', color: 'bg-orange-500' };
    if (streak >= 7) return { level: 'Beginner', color: 'bg-gray-500' };
    return { level: 'Starter', color: 'bg-gray-400' };
  };

  const getNextMilestone = (current: number) => {
    return STREAK_MILESTONES.find(milestone => milestone > current) || current + 100;
  };

  const getStreakMultiplier = (streak: number) => {
    if (streak >= 100) return 5;
    if (streak >= 60) return 4;
    if (streak >= 30) return 3;
    if (streak >= 14) return 2;
    if (streak >= 7) return 1.5;
    return 1;
  };

  const isStreakAtRisk = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 20; // At risk if no activity in 20+ hours
  };

  if (compact) {
    const totalCurrentStreak = streaks.reduce((sum, streak) => sum + streak.current_streak, 0);
    const maxStreak = Math.max(...streaks.map(s => s.current_streak));
    
    return (
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-full">
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-900">{maxStreak}</div>
            <div className="text-xs text-orange-700">Day Streak</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {getStreakMultiplier(maxStreak)}x multiplier
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {streaks.map((streak, index) => {
        const streakConfig = STREAK_TYPES[streak.streak_type];
        const Icon = streakConfig.icon;
        const level = getStreakLevel(streak.current_streak);
        const nextMilestone = getNextMilestone(streak.current_streak);
        const progressToNext = ((streak.current_streak % nextMilestone) / nextMilestone) * 100;
        const atRisk = isStreakAtRisk(streak.last_activity);

        return (
          <Card key={index} className={`${streakConfig.bgColor} border-l-4 border-l-orange-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${streakConfig.bgColor}`}>
                    <Icon className={`h-5 w-5 ${streakConfig.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{streakConfig.title}</h4>
                    <p className="text-sm text-gray-600">{streakConfig.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold text-gray-900">{streak.current_streak}</span>
                  </div>
                  <Badge className={`${level.color} text-white text-xs`}>
                    {level.level}
                  </Badge>
                </div>
              </div>

              {/* Streak Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{streak.longest_streak}</div>
                  <div className="text-xs text-gray-600">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{streak.streak_multiplier}x</div>
                  <div className="text-xs text-gray-600">Multiplier</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{nextMilestone}</div>
                  <div className="text-xs text-gray-600">Next Goal</div>
                </div>
              </div>

              {/* Progress to Next Milestone */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress to {nextMilestone} days</span>
                  <span className="font-medium">{streak.current_streak}/{nextMilestone}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(streak.current_streak / nextMilestone) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {streak.is_active ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                  
                  {atRisk && (
                    <Badge variant="destructive" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      At Risk
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Last activity: {new Date(streak.last_activity).toLocaleDateString()}
                </div>
              </div>

              {/* Streak Actions */}
              {atRisk && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Your streak is at risk!</p>
                      <p className="text-xs text-red-600">Complete an activity to keep it alive</p>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Save Streak
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StreakCounter;