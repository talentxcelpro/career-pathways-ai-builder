import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Trophy, 
  Zap, 
  Target, 
  Flame, 
  Star, 
  Gift, 
  Crown,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Wallet,
  Activity,
  Award,
  Pickaxe,
  ExternalLink,
  ChevronRight,
  Users,
  Sparkles
} from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

const GamificationCenter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balance, availableBalance, isLoading: balanceLoading, refreshBalance } = useTokenBalance();
  const { earnTXC, getAllRewards, isProcessing } = useTXCMining();
  const { stats, achievements, userStreaks, checkAchievements } = useGamification();
  const [activeTab, setActiveTab] = useState('dashboard');

  const currentLevel = stats?.level || 1;
  const progressToNext = ((stats?.currentLevelPoints || 0) / (stats?.nextLevelPoints || 1000)) * 100;

  const handleEarnTXC = async (action: string) => {
    const success = await earnTXC(action);
    if (success) {
      refreshBalance();
      await checkAchievements(action);
    }
  };

  const navigateToMining = () => {
    navigate('/txc/mining');
  };

  const quickRewards = [
    { action: 'daily_login', icon: Calendar, label: 'Daily Check-in', amount: 75, color: 'from-green-500 to-emerald-600' },
    { action: 'profile_completed', icon: Target, label: 'Complete Profile', amount: 300, color: 'from-blue-500 to-blue-600' },
    { action: 'post_created', icon: Sparkles, label: 'Create Post', amount: 150, color: 'from-purple-500 to-purple-600' },
    { action: 'connection_made', icon: Users, label: 'New Connection', amount: 75, color: 'from-orange-500 to-orange-600' }
  ];

  const recentAchievements = achievements.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Helmet>
        <title>TXC Gamification Center | TalentXcel</title>
        <meta name="description" content="Track your progress, earn achievements, and manage your TXC tokens in our gamification center." />
        <link rel="canonical" href="https://talentxcel.in/gamification" />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TXC Dashboard
            </h1>
            <p className="text-muted-foreground">Level {currentLevel} • {stats?.totalPoints || 0} Points</p>
          </div>
          
          {/* Compact Balance Card */}
          <Card className="bg-gradient-to-r from-warning/10 to-yellow-500/10 border-warning/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-yellow-600 rounded-xl flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">{availableBalance.toLocaleString()} TXC</div>
                  <div className="text-xs text-muted-foreground">Available Balance</div>
                </div>
                <Button 
                  size="sm" 
                  onClick={navigateToMining}
                  className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Pickaxe className="h-4 w-4 mr-1" />
                  Mine More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-primary">{stats?.totalPoints || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Points</div>
                </div>
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <Progress value={progressToNext} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-orange-600">{userStreaks?.current_login_streak || 0}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-green-500/5 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-success">{achievements.length}</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </div>
                <Award className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-purple-500/5 border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-secondary">#{Math.floor(Math.random() * 100) + 1}</div>
                  <div className="text-xs text-muted-foreground">Global Rank</div>
                </div>
                <Crown className="h-6 w-6 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-success" />
                    Quick Earn
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={navigateToMining}
                      className="ml-auto text-xs"
                    >
                      View All <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickRewards.map((reward) => (
                    <div key={reward.action} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${reward.color} rounded-lg flex items-center justify-center`}>
                          <reward.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{reward.label}</div>
                          <div className="text-xs text-muted-foreground">+{reward.amount} TXC</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEarnTXC(reward.action)}
                        disabled={isProcessing}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    Recent Achievements
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab('achievements')}
                      className="ml-auto text-xs"
                    >
                      View All <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-warning/5">
                        <div className="w-8 h-8 bg-gradient-to-r from-warning to-yellow-600 rounded-lg flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.achievement_name}</div>
                          <div className="text-xs text-muted-foreground">+{achievement.txc_reward} TXC</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No achievements yet</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={navigateToMining}
                        className="mt-2"
                      >
                        Start Earning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Level Progress</span>
                      <span className="text-sm text-muted-foreground">Level {currentLevel}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {stats?.currentLevelPoints || 0} / {stats?.nextLevelPoints || 1000} points
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Login Streak</span>
                      <span className="text-sm text-muted-foreground">{userStreaks?.current_login_streak || 0} days</span>
                    </div>
                    <Progress value={Math.min((userStreaks?.current_login_streak || 0) / 30 * 100, 100)} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Best: {userStreaks?.longest_login_streak || 0} days
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">TXC Balance</span>
                      <span className="text-sm text-muted-foreground">{formatTXC(availableBalance)}</span>
                    </div>
                    <Progress value={Math.min(availableBalance / 10000 * 100, 100)} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Goal: 10,000 TXC
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Achievements ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-r from-warning to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{achievement.achievement_name}</div>
                          <div className="text-xs text-muted-foreground">+{achievement.txc_reward} TXC</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">No achievements yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start completing activities to earn your first achievement!</p>
                    <Button onClick={navigateToMining}>
                      <Pickaxe className="h-4 w-4 mr-2" />
                      Start Mining TXC
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">Leaderboard Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">Compete with other users and climb the rankings!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationCenter;