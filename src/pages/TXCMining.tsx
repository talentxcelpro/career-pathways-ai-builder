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

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How TXC Mining Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Complete Activities</h3>
                <p className="text-sm text-muted-foreground">
                  Create posts, connect with professionals, build your profile, and engage with the community.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Earn TXC Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Each activity rewards you with TXC tokens. Different activities have different reward amounts.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Unlock Features</h3>
                <p className="text-sm text-muted-foreground">
                  Use your earned TXC to purchase premium features, upgrades, and exclusive tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symbolic Mining Visual */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Coins className="h-20 w-20 text-green-600 animate-bounce" />
                <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">⛏️ Active Mining Session</h3>
              <p className="text-muted-foreground mb-4">Your activities are earning TXC tokens in real-time!</p>
              <div className="flex justify-center gap-4">
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow">
                  <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Fast Earning</p>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow">
                  <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Rewards Ready</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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