import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { useTXCPurchase } from '@/hooks/useTXCPurchase';
import { useUserScores } from '@/hooks/useUserScores';
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
  Rocket, 
  Star, 
  Gift, 
  Shield, 
  Crown,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Hexagon,
  Layers,
  ArrowRight,
  Plus,
  Wallet,
  Activity,
  Award,
  Lock,
  Unlock
} from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';
import { TXC_MINING_REWARDS } from '@/hooks/useTXCMining';
import { BlockchainStats } from '@/components/gamification/BlockchainStats';
import { TXCMiningCenter } from '@/components/gamification/TXCMiningCenter';
import { TXCMarketplace } from '@/components/gamification/TXCMarketplace';
import { AchievementGallery } from '@/components/gamification/AchievementGallery';
import { LeaderboardsWidget } from '@/components/gamification/LeaderboardsWidget';
import { StreakTracker } from '@/components/gamification/StreakTracker';

const GamificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { balance, availableBalance, isLoading: balanceLoading, refreshBalance } = useTokenBalance();
  const { earnTXC, getAllRewards, isProcessing } = useTXCMining();
  const { canAfford, purchaseFeature } = useTXCPurchase();
  const { data: userScores } = useUserScores();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome for new users with low scores
    if (userScores && userScores.total_points < 100) {
      setShowWelcome(true);
    }
  }, [userScores]);

  const handleEarnTXC = async (action: string) => {
    const success = await earnTXC(action);
    if (success) {
      refreshBalance();
      toast({
        title: "TXC Earned! 🎉",
        description: `You earned ${TXC_MINING_REWARDS[action]?.amount || 0} TXC tokens!`,
      });
    }
  };

  const currentLevel = Math.floor((userScores?.total_points || 0) / 1000) + 1;
  const progressToNext = ((userScores?.total_points || 0) % 1000) / 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Helmet>
        <title>TXC Blockchain Gamification Center | TalentXcel</title>
        <meta name="description" content="Earn TXC tokens through blockchain-powered gamification. Complete activities, build streaks, unlock achievements, and spend TXC in our marketplace." />
        <link rel="canonical" href="https://talentxcel.in/gamification" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 animate-pulse"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center mb-8">
            {/* Blockchain Visual Element */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                  <Hexagon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">
                  <Coins className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              TXC Blockchain Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Experience the future of career advancement with blockchain-powered rewards. 
              Earn, spend, and trade <span className="font-bold text-yellow-600">TXC tokens</span> in our decentralized ecosystem.
            </p>

            {/* TXC Balance Display */}
            <div className="flex justify-center mb-8">
              <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold text-yellow-700">
                        {availableBalance.toLocaleString()} TXC
                      </div>
                      <div className="text-sm text-yellow-600">Available Balance</div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold text-yellow-700">
                        Level {currentLevel}
                      </div>
                      <div className="text-sm text-yellow-600">{userScores?.total_points || 0} Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                onClick={() => handleEarnTXC('daily_login')}
                disabled={isProcessing}
              >
                <Zap className="h-5 w-5 mr-2" />
                Daily Check-in
                <Badge className="ml-2 bg-green-400">+75 TXC</Badge>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => setActiveTab('marketplace')}
              >
                <Gift className="h-5 w-5 mr-2" />
                TXC Marketplace
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboards
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mining" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Mining
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Marketplace
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

          <TabsContent value="overview" className="space-y-8">
            {/* Progress Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">{userScores?.total_points || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <Progress value={progressToNext} className="mt-4" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {1000 - ((userScores?.total_points || 0) % 1000)} points to level {currentLevel + 1}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{availableBalance.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">TXC Tokens</div>
                    </div>
                    <Coins className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +24% this week
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">7</div>
                      <div className="text-sm text-muted-foreground">Day Streak</div>
                    </div>
                    <Flame className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-xs text-orange-600 mt-2">Keep it going! 🔥</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-muted-foreground">Achievements</div>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-xs text-green-600 mt-2">3 new this week!</div>
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Stats */}
            <BlockchainStats />

            {/* Daily Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(TXC_MINING_REWARDS).slice(0, 6).map(([action, reward]) => (
                    <div key={action} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{reward.description}</h4>
                        <Badge variant="secondary">+{reward.amount} TXC</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Cooldown: {reward.cooldownMinutes ? `${reward.cooldownMinutes}m` : 'None'}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleEarnTXC(action)}
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streak Tracker */}
            <StreakTracker />
          </TabsContent>

          <TabsContent value="mining">
            <TXCMiningCenter />
          </TabsContent>

          <TabsContent value="marketplace">
            <TXCMarketplace />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementGallery />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardsWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationCenter;