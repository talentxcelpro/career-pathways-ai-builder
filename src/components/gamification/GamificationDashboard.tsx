import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Zap, 
  Star, 
  Crown, 
  Target,
  TrendingUp,
  Activity,
  Flame,
  Award,
  Users,
  Coins,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useUserScores } from '@/hooks/useUserScores';
import { useRealLeaderboard } from '@/hooks/useRealLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GamificationDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userScores } = useUserScores();
  const { userRanking } = useRealLeaderboard();

  // Mock data for entertainment design
  const stats = {
    level: Math.floor((userScores?.total_points || 0) / 1000) + 1,
    currentXP: (userScores?.total_points || 0) % 1000,
    nextLevelXP: 1000,
    streak: 7,
    longestStreak: 15,
    weeklyGoal: 5000,
    weeklyProgress: 3200,
    rank: userRanking?.rank || 42,
    totalUsers: userRanking?.total_users || 1250,
    percentile: userRanking?.percentile || 85
  };

  const quickStats = [
    {
      icon: Trophy,
      label: 'Level',
      value: stats.level,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${stats.streak}d`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Target,
      label: 'Rank',
      value: `#${stats.rank}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Star,
      label: 'Top',
      value: `${stats.percentile}%`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your profile',
      icon: Star,
      earned: true,
      rarity: 'common',
      points: 100
    },
    {
      id: 2,
      name: 'Streak Master',
      description: '7-day login streak',
      icon: Flame,
      earned: true,
      rarity: 'rare',
      points: 500
    },
    {
      id: 3,
      name: 'Goal Crusher',
      description: 'Complete weekly goal',
      icon: Target,
      earned: false,
      rarity: 'epic',
      points: 1000
    },
    {
      id: 4,
      name: 'Legend',
      description: 'Reach top 10',
      icon: Crown,
      earned: false,
      rarity: 'legendary',
      points: 5000
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-yellow-300" />
                <span className="text-2xl font-bold">Level {stats.level}</span>
                <Badge className="bg-white/20 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <p className="text-white/80">Welcome back, champion!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.currentXP}</div>
              <div className="text-sm text-white/80">/ {stats.nextLevelXP} XP</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{Math.round((stats.currentXP / stats.nextLevelXP) * 100)}%</span>
            </div>
            <Progress 
              value={(stats.currentXP / stats.nextLevelXP) * 100} 
              className="h-3 bg-white/20"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-2 rounded-lg bg-white/20 mb-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => navigate('/txc/mining')}
          className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Mine TXC</div>
              <div className="text-xs opacity-90">Earn tokens</div>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="h-16"
          onClick={() => navigate('/network/leaderboards')}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <div className="font-semibold">Leaderboard</div>
              <div className="text-xs text-muted-foreground">Rank #{stats.rank}</div>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        </Button>
      </div>

      {/* Current Goals */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-green-500" />
            Weekly Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Earn 5,000 TXC</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
              </Badge>
            </div>
            <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{stats.weeklyProgress.toLocaleString()} / {stats.weeklyGoal.toLocaleString()}</span>
              <span>{stats.weeklyGoal - stats.weeklyProgress} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-purple-500" />
              Achievements
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    achievement.earned 
                      ? getRarityColor(achievement.rarity)
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  {achievement.earned && achievement.rarity === 'legendary' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${
                      achievement.earned ? 'bg-white/80' : 'bg-gray-300'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        achievement.earned 
                          ? getRarityTextColor(achievement.rarity)
                          : 'text-gray-500'
                      }`} />
                    </div>
                    
                    <h4 className={`font-semibold text-sm mb-1 ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </h4>
                    
                    <p className={`text-xs ${
                      achievement.earned ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.earned && (
                      <Badge className="mt-2 text-xs bg-green-100 text-green-800 border-0">
                        +{achievement.points} XP
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-500" />
              Your Position
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/network/leaderboards')}
            >
              Full Leaderboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
                <span className="text-lg font-bold text-blue-600">#{stats.rank}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Rank #{stats.rank}</div>
                <div className="text-sm text-gray-600">of {stats.totalUsers.toLocaleString()} users</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{stats.percentile}%</div>
              <div className="text-xs text-gray-600">Top percentile</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};