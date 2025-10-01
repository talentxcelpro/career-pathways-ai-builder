import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TXCMiningDashboard } from '@/components/txc/TXCMiningDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Zap, Trophy, Target, Gift, Sparkles, BarChart3, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { formatTXC } from '@/types/txc-pricing';
import txcMascot from '@/assets/txc-mascot.jpg';
import { RetroactiveTXCAdmin } from '@/components/admin/RetroactiveTXCAdmin';
import { ComprehensiveTXCDistribution } from '@/components/admin/ComprehensiveTXCDistribution';

const TXCMining: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { availableBalance, lifetimeEarned } = useTokenBalance();
  const { earnTXC } = useTXCMining();
  const [hasTriggeredWelcomeBonus, setHasTriggeredWelcomeBonus] = useState(false);
  
  // Auto-trigger welcome bonus for new users
  useEffect(() => {
    if (user && !hasTriggeredWelcomeBonus && availableBalance === 0 && lifetimeEarned === 0) {
      const triggerWelcomeBonus = async () => {
        try {
          await earnTXC('joining_bonus');
          setHasTriggeredWelcomeBonus(true);
        } catch (error) {
          console.log('Welcome bonus already claimed or unavailable');
        }
      };
      
      // Small delay to let other systems initialize
      const timer = setTimeout(triggerWelcomeBonus, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, availableBalance, lifetimeEarned, earnTXC, hasTriggeredWelcomeBonus]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Helmet>
        <title>TXC Mining - Earn Tokens | TalentXcel</title>
        <meta name="description" content="Earn TXC tokens by completing activities like creating posts, connecting with professionals, and building your profile. Mine TXC to unlock premium features." />
        <link rel="canonical" href="https://talentxcel.in/txc/mining" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/gamification')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/gamification')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Progress
            </Button>
          </div>
        </div>

        {/* Welcome Header with Mascot */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={txcMascot} 
                alt="TXC Mining Mascot" 
                className="w-24 h-24 rounded-full shadow-lg border-4 border-primary/20"
              />
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-primary to-secondary text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  EARN
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary/60 bg-clip-text text-transparent mb-4">
            Welcome to TXC Mining! 🎉
          </h1>
          
          {/* Personal Greeting */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-primary">Great news, {user?.user_metadata?.full_name || 'Explorer'}!</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Your current TXC balance: <span className="font-bold text-primary">{formatTXC(availableBalance)}</span> TXC tokens! 
              {availableBalance > 0 && " Keep earning more by completing activities! 🎁"}
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-lg">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-semibold">Active Mining Rewards Available!</span>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete activities to mine more tokens and unlock amazing premium features. Every action earns you TXC!
          </p>
        </div>

        {/* Active Mining Session - Apple-inspired Design */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/95 via-green-500/95 to-teal-500/95 dark:from-emerald-600/90 dark:via-green-600/90 dark:to-teal-600/90 shadow-2xl">
          {/* Backdrop blur effect */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-white/10 dark:bg-black/10"></div>
          
          {/* Content */}
          <div className="relative px-8 py-12">
            <div className="text-center">
              {/* Animated Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/90 dark:bg-white/20 rounded-full p-5 backdrop-blur-sm shadow-lg">
                  <Coins className="h-16 w-16 text-emerald-600 dark:text-emerald-300 animate-bounce" />
                </div>
                <Sparkles className="h-7 w-7 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              
              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                ⛏️ Active Mining Session
              </h3>
              
              {/* Subtitle */}
              <p className="text-lg text-white/90 mb-8 max-w-md mx-auto font-medium">
                Your activities are earning TXC tokens in real-time!
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="group bg-white/95 dark:bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 group-hover:animate-pulse" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Fast Earning</p>
                  </div>
                </div>
                
                <div className="group bg-white/95 dark:bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-300 group-hover:animate-pulse" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Rewards Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Apple-inspired Design */}
        <div className="mb-8 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-lg overflow-hidden">
          <div className="px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 rounded-2xl p-2.5">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">How TXC Mining Works</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center space-y-4 p-6 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Complete Activities</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create posts, connect with professionals, build your profile, and engage with the community.
                </p>
              </div>
              
              <div className="group text-center space-y-4 p-6 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Coins className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Earn TXC Tokens</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each activity rewards you with TXC tokens. Different activities have different reward amounts.
                </p>
              </div>
              
              <div className="group text-center space-y-4 p-6 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Unlock Features</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use your earned TXC to purchase premium features, upgrades, and exclusive tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mining Dashboard */}
        <TXCMiningDashboard />

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Mining Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold">Daily Activities</h4>
                <p className="text-sm text-muted-foreground">
                  Log in daily and complete your profile to earn consistent TXC rewards.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Quality Content</h4>
                <p className="text-sm text-muted-foreground">
                  Create meaningful posts and engage genuinely with others for maximum rewards.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Skill Development</h4>
                <p className="text-sm text-muted-foreground">
                  Complete courses and add new skills to your profile for bonus TXC.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Network Building</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with professionals and give recommendations to grow your network and earnings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TXCMining;