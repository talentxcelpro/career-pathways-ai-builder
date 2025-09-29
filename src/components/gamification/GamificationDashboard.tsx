import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
import { useTokenBalance } from '@/hooks/useTokenBalance';
// TEMPORARILY DISABLED TXC - import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useUnifiedGamification } from '@/hooks/useUnifiedGamification';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { TXCFloatingEarner } from './TXCFloatingEarner';
import { useDailyLoginBonus } from '@/hooks/useDailyLoginBonus';

export const GamificationDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: userScores } = useUserScores();
  const { userRanking } = useRealLeaderboard();
  const { balance, availableBalance, refreshBalance } = useTokenBalance();
  // TEMPORARILY DISABLED TXC - const txcIntegration = useTXCIntegration();
  const { userRanking: unifiedUserRanking, userAchievements, triggerProfileCompleted } = useUnifiedGamification();
  const [recentEarning, setRecentEarning] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Initialize daily login bonus - TEMPORARILY DISABLED
  // useDailyLoginBonus();

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name, first_name')
      .eq('id', user.id)
      .single();
    
    setUserProfile(data);
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  // Refresh balance every 5 seconds for real-time updates
  useEffect(() => {
    if (!user) return;
    
    const balanceInterval = setInterval(() => {
      refreshBalance();
    }, 5000);

    return () => clearInterval(balanceInterval);
  }, [user, refreshBalance]);

  // TEMPORARILY DISABLED AUTO-EARNING TXC
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (user && Math.random() > 0.95) { // 5% chance every 5 minutes
  //       const actions = ['post_liked', 'comment_made'];
  //       const randomAction = actions[Math.floor(Math.random() * actions.length)];
  //       const earned = await txcIntegration.earnTXC(randomAction);
  //       if (earned) {
  //         setRecentEarning(Date.now());
  //         setTimeout(() => setRecentEarning(null), 3000);
  //       }
  //     }
  //   }, 300000); // Check every 5 minutes
  //
  //   return () => clearInterval(interval);
  // }, [user, txcIntegration]);

  // Enhanced stats with real-time TXC balance and real data only
  const stats = {
    level: Math.floor((unifiedUserRanking?.total_points || userScores?.total_points || 0) / 1000) + 1,
    currentXP: (unifiedUserRanking?.total_points || userScores?.total_points || 0) % 1000,
    nextLevelXP: 1000,
    streak: unifiedUserRanking?.current_streak || 0,
    longestStreak: unifiedUserRanking?.current_streak || 0,
    weeklyGoal: 5000,
    weeklyProgress: Math.min((unifiedUserRanking?.total_points || userScores?.total_points || 0), 5000),
    rank: unifiedUserRanking?.rank || userRanking?.rank || '--',
    totalUsers: userRanking?.total_users || 1,
    percentile: userRanking?.percentile || '--',
    txcBalance: unifiedUserRanking?.txc_balance || availableBalance || 0,
    achievementsEarned: unifiedUserRanking?.achievements_count || 0
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
      icon: Coins,
      label: 'TXC',
      value: stats.txcBalance.toLocaleString(),
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      animated: recentEarning
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
              <p className="text-white/80">Welcome back, {userProfile?.full_name || userProfile?.first_name || 'Champion'}!</p>
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
                <div key={index} className={`text-center transition-all duration-500 ${stat.animated ? 'animate-bounce' : ''}`}>
                  <div className={`inline-flex p-2 rounded-lg bg-white/20 mb-2 ${stat.animated ? 'ring-2 ring-yellow-300 ring-opacity-60' : ''}`}>
                    <Icon className={`h-4 w-4 ${stat.animated ? 'text-yellow-300' : ''}`} />
                  </div>
                  <div className={`text-lg font-bold ${stat.animated ? 'text-yellow-300' : ''}`}>
                    {stat.value}
                    {stat.animated && <Sparkles className="inline h-3 w-3 ml-1 animate-pulse" />}
                  </div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TXC Balance Card - Prominent Display */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">TXC Balance</h3>
                <p className="text-sm text-green-700">Your digital tokens</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold text-green-600 transition-all duration-500 ${recentEarning ? 'animate-pulse text-yellow-600' : ''}`}>
                {stats.txcBalance.toLocaleString()}
                {recentEarning && <Sparkles className="inline h-5 w-5 ml-2 animate-bounce text-yellow-500" />}
              </div>
              <div className="text-sm text-green-600">TXC Tokens</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/txc/mining')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Mine More
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                // TEMPORARILY DISABLED TXC
                // await txcIntegration.triggerSocialActivity();
                refreshBalance();
              }}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Activity className="h-4 w-4 mr-2" />
              Quick Earn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
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
        
        <Button
          variant="outline"
          className="h-16"
          onClick={async () => {
            await triggerProfileCompleted();
            // TEMPORARILY DISABLED TXC
            // await txcIntegration.triggerProfileCompleted();
            toast({
              title: "Profile Updated! 🎉",
              description: "Keep completing activities to earn more rewards!"
            });
          }}
        >
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div className="text-left">
              <div className="font-semibold">Earn Bonus</div>
              <div className="text-xs text-muted-foreground">Complete tasks</div>
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
                <span className="text-lg font-bold text-blue-600">
                  {typeof stats.rank === 'number' ? `#${stats.rank}` : '--'}
                </span>
              </div>
              <div>
              <div className="font-semibold text-gray-900">
                {typeof stats.rank === 'number' ? `Rank #${stats.rank}` : 'Calculating rank...'}
              </div>
              <div className="text-sm text-gray-600">of {stats.totalUsers.toLocaleString()} users</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {typeof stats.percentile === 'number' ? `${stats.percentile}%` : '--'}
              </div>
              <div className="text-xs text-gray-600">Top percentile</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live TXC Earning Component */}
      <TXCFloatingEarner />
    </div>
  );
};