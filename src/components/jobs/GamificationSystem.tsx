import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Award, 
  Zap, 
  Calendar,
  TrendingUp,
  Users,
  Send,
  Eye,
  BookOpen
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'application' | 'profile' | 'learning' | 'engagement';
  points: number;
  unlocked: boolean;
  progress: number;
  total_required: number;
  unlocked_at?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  points: number;
  expires_at: string;
  category: 'applications' | 'views' | 'profile' | 'learning';
}

interface UserStats {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  applications_sent: number;
  profile_views: number;
  jobs_saved: number;
  achievements_unlocked: number;
  rank_percentile: number;
}

export const GamificationSystem: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ['user-stats', currentUser?.id],
    queryFn: async (): Promise<UserStats> => {
      // Mock data for demonstration
      return {
        total_points: 1250,
        level: 7,
        current_streak: 5,
        longest_streak: 12,
        applications_sent: 24,
        profile_views: 156,
        jobs_saved: 48,
        achievements_unlocked: 8,
        rank_percentile: 75
      };
    },
    enabled: !!currentUser
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', currentUser?.id],
    queryFn: async (): Promise<Achievement[]> => {
      return [
        {
          id: '1',
          title: 'First Steps',
          description: 'Submit your first job application',
          icon: <Send className="h-5 w-5" />,
          category: 'application',
          points: 50,
          unlocked: true,
          progress: 1,
          total_required: 1,
          unlocked_at: '2024-01-15'
        },
        {
          id: '2',
          title: 'Job Hunter',
          description: 'Apply to 10 jobs',
          icon: <Target className="h-5 w-5" />,
          category: 'application',
          points: 200,
          unlocked: true,
          progress: 10,
          total_required: 10,
          unlocked_at: '2024-01-20'
        },
        {
          id: '3',
          title: 'Profile Perfect',
          description: 'Complete 100% of your profile',
          icon: <Star className="h-5 w-5" />,
          category: 'profile',
          points: 100,
          unlocked: false,
          progress: 85,
          total_required: 100
        },
        {
          id: '4',
          title: 'Learning Enthusiast',
          description: 'Complete 5 skill assessments',
          icon: <BookOpen className="h-5 w-5" />,
          category: 'learning',
          points: 150,
          unlocked: false,
          progress: 3,
          total_required: 5
        },
        {
          id: '5',
          title: 'Streak Master',
          description: 'Maintain a 7-day job search streak',
          icon: <Flame className="h-5 w-5" />,
          category: 'engagement',
          points: 300,
          unlocked: false,
          progress: 5,
          total_required: 7
        }
      ];
    },
    enabled: !!currentUser
  });

  const { data: dailyChallenges = [] } = useQuery({
    queryKey: ['daily-challenges', currentUser?.id],
    queryFn: async (): Promise<DailyChallenge[]> => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      return [
        {
          id: '1',
          title: 'Application Sprint',
          description: 'Apply to 3 jobs today',
          target: 3,
          current: 1,
          points: 75,
          expires_at: tomorrow.toISOString(),
          category: 'applications'
        },
        {
          id: '2',
          title: 'Job Explorer',
          description: 'View 10 job details',
          target: 10,
          current: 7,
          points: 50,
          expires_at: tomorrow.toISOString(),
          category: 'views'
        },
        {
          id: '3',
          title: 'Profile Optimizer',
          description: 'Update your profile',
          target: 1,
          current: 0,
          points: 100,
          expires_at: tomorrow.toISOString(),
          category: 'profile'
        }
      ];
    },
    enabled: !!currentUser
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      return [
        { rank: 1, name: 'Alex Chen', points: 2850, level: 12 },
        { rank: 2, name: 'Sarah Kim', points: 2640, level: 11 },
        { rank: 3, name: 'Michael R.', points: 2420, level: 10 },
        { rank: 4, name: 'You', points: userStats?.total_points || 1250, level: userStats?.level || 7 },
        { rank: 5, name: 'Emma Wilson', points: 1180, level: 6 }
      ];
    },
    enabled: !!userStats
  });

  const calculateLevelProgress = () => {
    if (!userStats) return 0;
    const pointsInCurrentLevel = userStats.total_points % 200; // 200 points per level
    return (pointsInCurrentLevel / 200) * 100;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <div className="text-gray-500">Login to view your achievements and progress</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Career Game Center
        </CardTitle>
        <div className="flex gap-2">
          {['overview', 'achievements', 'challenges', 'leaderboard'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'overview' && userStats && (
          <div className="space-y-6">
            {/* User Level & Progress */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">Level {userStats.level}</span>
              </div>
              <div className="text-lg font-semibold text-blue-600 mb-2">
                {userStats.total_points} Points
              </div>
              <Progress value={calculateLevelProgress()} className="w-48 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {200 - (userStats.total_points % 200)} points to next level
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-xl font-bold">{userStats.current_streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Send className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-xl font-bold">{userStats.applications_sent}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-xl font-bold">{userStats.achievements_unlocked}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-xl font-bold">{userStats.rank_percentile}%</div>
                <div className="text-sm text-gray-600">Top Percentile</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="font-semibold mb-3">Recent Achievements</h3>
              <div className="space-y-2">
                {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 border rounded-lg ${
                  achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}`}>
                        {achievement.title}
                      </h3>
                      <Badge className={achievement.unlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.total_required}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.total_required) * 100} />
                      </div>
                    )}
                    {achievement.unlocked && achievement.unlocked_at && (
                      <div className="text-xs text-green-600">
                        Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Daily Challenges</span>
              <Badge variant="outline">Resets in {getTimeRemaining(dailyChallenges[0]?.expires_at)}</Badge>
            </div>
            {dailyChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {challenge.points} pts
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.current}/{challenge.target}</span>
                  </div>
                  <Progress value={(challenge.current / challenge.target) * 100} />
                </div>
                {challenge.current >= challenge.target && (
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Completed
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Weekly Leaderboard</span>
            </div>
            {leaderboard.map((user, index) => (
              <div 
                key={user.rank} 
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  user.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className={`text-2xl font-bold ${
                  user.rank === 1 ? 'text-yellow-500' : 
                  user.rank === 2 ? 'text-gray-400' : 
                  user.rank === 3 ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${user.name === 'You' ? 'text-blue-800' : ''}`}>
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600">Level {user.level}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{user.points.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};