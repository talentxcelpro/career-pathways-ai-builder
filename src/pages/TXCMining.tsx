import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TXCMiningDashboard } from '@/components/txc/TXCMiningDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Zap, Trophy, Target } from 'lucide-react';

const TXCMining: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>TXC Mining - Earn Tokens | TalentXcel</title>
        <meta name="description" content="Earn TXC tokens by completing activities like creating posts, connecting with professionals, and building your profile. Mine TXC to unlock premium features." />
        <link rel="canonical" href="https://talentxcel.in/txc/mining" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            TXC Mining Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn TXC tokens by being active on the platform. Complete activities to mine tokens and unlock premium features.
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