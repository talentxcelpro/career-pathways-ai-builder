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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
      <Helmet>
        <title>TXC Blockchain Gamification Center | TalentXcel</title>
        <meta name="description" content="Earn TXC tokens through blockchain-powered gamification. Complete activities, build streaks, unlock achievements, and spend TXC in our marketplace." />
        <link rel="canonical" href="https://talentxcel.in/gamification" />
      </Helmet>

      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/20 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-accent/20 rounded-full animate-float delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-success/20 rounded-full animate-float delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            {/* Blockchain Visual Element */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl flex items-center justify-center shadow-elegant animate-glow-pulse backdrop-blur-sm border border-white/20">
                  <Hexagon className="h-16 w-16 text-white animate-rotate-scale" />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-warning to-yellow-600 rounded-full flex items-center justify-center animate-bounce shadow-glow">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center animate-pulse shadow-glow">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gradient-to-br from-accent to-pink-600 rounded-full flex items-center justify-center animate-ping">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-heading font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 animate-fade-in-down">
              TXC Blockchain Hub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 animate-fade-in-up leading-relaxed">
              Experience the future of career advancement with blockchain-powered rewards. 
              Earn, spend, and trade <span className="font-bold bg-gradient-to-r from-warning to-yellow-600 bg-clip-text text-transparent">TXC tokens</span> in our decentralized ecosystem.
            </p>

            {/* TXC Balance Display */}
            <div className="flex justify-center mb-12 animate-scale-in">
              <Card variant="glass" className="bg-gradient-to-r from-warning/10 via-yellow-500/10 to-warning/10 border-warning/30 backdrop-blur-apple shadow-glow hover:shadow-elegant transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 flex-wrap justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-warning to-yellow-600 rounded-2xl flex items-center justify-center shadow-glow animate-glow-pulse">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-warning to-yellow-600 bg-clip-text text-transparent">
                        {availableBalance.toLocaleString()} TXC
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Level {currentLevel}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{userScores?.total_points || 0} Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-6 animate-stagger-fade-in">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-elegant hover:shadow-glow transition-all duration-300 border-0 px-8 py-3 text-lg font-semibold"
                onClick={() => handleEarnTXC('daily_login')}
                disabled={isProcessing}
              >
                <Zap className="h-6 w-6 mr-3" />
                Daily Check-in
                <Badge className="ml-3 bg-green-400 text-green-900 font-bold px-3 py-1">+75 TXC</Badge>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary/50 text-primary hover:bg-primary hover:text-white shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg font-semibold backdrop-blur-sm bg-white/10"
                onClick={() => setActiveTab('marketplace')}
              >
                <Gift className="h-6 w-6 mr-3" />
                TXC Marketplace
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-secondary/50 text-secondary hover:bg-secondary hover:text-white shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg font-semibold backdrop-blur-sm bg-white/10"
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy className="h-6 w-6 mr-3" />
                Leaderboards
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-apple border border-white/20 shadow-elegant rounded-2xl p-2">
            <TabsTrigger value="overview" className="flex items-center gap-3 rounded-xl text-lg font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-white data-[state=active]:shadow-glow">
              <Activity className="h-5 w-5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mining" className="flex items-center gap-3 rounded-xl text-lg font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-glow">
              <Zap className="h-5 w-5" />
              <span className="hidden sm:inline">Mining</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-3 rounded-xl text-lg font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-warning data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-glow">
              <Gift className="h-5 w-5" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-3 rounded-xl text-lg font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-glow">
              <Award className="h-5 w-5" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-3 rounded-xl text-lg font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-glow">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-10 animate-fade-in">
            {/* Progress Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card variant="elegant" className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                        {userScores?.total_points || 0}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">Total Points</div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <Progress value={progressToNext} className="mt-4 h-3 bg-primary/20" />
                  <div className="text-xs text-muted-foreground mt-3 font-medium">
                    {1000 - ((userScores?.total_points || 0) % 1000)} points to level {currentLevel + 1}
                  </div>
                </CardContent>
              </Card>

              <Card variant="elegant" className="bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 border-warning/30 hover:border-warning/50 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-warning to-yellow-600 bg-clip-text text-transparent">
                        {availableBalance.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">TXC Tokens</div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-warning to-yellow-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <Coins className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="text-sm text-success font-medium flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                    +24% this week
                  </div>
                </CardContent>
              </Card>

              <Card variant="elegant" className="bg-gradient-to-br from-orange-500/15 via-orange-500/10 to-orange-500/5 border-orange-400/30 hover:border-orange-400/50 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">7</div>
                      <div className="text-sm font-medium text-muted-foreground">Day Streak</div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <Flame className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="text-sm text-orange-600 font-medium bg-orange-100 px-3 py-1 rounded-full">Keep it going! 🔥</div>
                </CardContent>
              </Card>

              <Card variant="elegant" className="bg-gradient-to-br from-success/15 via-success/10 to-success/5 border-success/30 hover:border-success/50 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">12</div>
                      <div className="text-sm font-medium text-muted-foreground">Achievements</div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="text-sm text-success font-medium bg-success/10 px-3 py-1 rounded-full">3 new this week!</div>
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Stats */}
            <BlockchainStats />

            {/* Daily Activities */}
            <Card variant="glass" className="backdrop-blur-apple border-white/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Daily Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(TXC_MINING_REWARDS).slice(0, 6).map(([action, reward], index) => (
                    <div key={action} className="group p-6 border border-white/20 rounded-2xl hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm hover:scale-105">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {reward.description}
                        </h4>
                        <Badge className="bg-gradient-to-r from-warning to-yellow-600 text-white font-bold px-3 py-1 shadow-glow">
                          +{reward.amount} TXC
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reward.cooldownMinutes ? `${reward.cooldownMinutes}m` : 'No limit'}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleEarnTXC(action)}
                          disabled={isProcessing}
                          className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-elegant hover:shadow-glow transition-all duration-300"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Earn
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