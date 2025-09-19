import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining, TXC_MINING_REWARDS } from '@/hooks/useTXCMining';
import { Coins, Zap, Star, Clock, TrendingUp, Gift } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

export const TXCMiningPage = () => {
  const { balance, isLoading: balanceLoading } = useTokenBalance();
  const { earnTXC, isProcessing } = useTXCMining();

  const totalPossibleDaily = Object.values(TXC_MINING_REWARDS)
    .filter(reward => reward.cooldownMinutes && reward.cooldownMinutes <= 1440)
    .reduce((sum, reward) => sum + reward.amount, 0);

  const handleManualClaim = async (action: string) => {
    await earnTXC(action);
  };

  const miningOpportunities = [
    {
      action: 'post_created',
      icon: <Zap className="h-5 w-5" />,
      status: 'available',
      category: 'Social Activity'
    },
    {
      action: 'connection_made',
      icon: <Star className="h-5 w-5" />,
      status: 'available',
      category: 'Networking'
    },
    {
      action: 'job_applied',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'available',
      category: 'Career Growth'
    },
    {
      action: 'recommendation_given',
      icon: <Gift className="h-5 w-5" />,
      status: 'available',
      category: 'Community'
    },
    {
      action: 'course_completed',
      icon: <Star className="h-5 w-5" />,
      status: 'high-reward',
      category: 'Learning'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">TXC Mining Center</h1>
        <p className="text-muted-foreground">Earn TXC tokens through platform activities</p>
      </div>

      {/* Balance Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Coins className="h-6 w-6" />
            Current Balance
          </CardTitle>
          <div className="text-4xl font-bold text-primary">
            {balanceLoading ? '...' : formatTXC(balance?.available || 0)}
          </div>
          <CardDescription>
            Lifetime Earned: {formatTXC(balance?.lifetime_earned || 0)}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Mining Opportunities</TabsTrigger>
          <TabsTrigger value="rewards">Reward System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {miningOpportunities.map((opportunity) => {
              const reward = TXC_MINING_REWARDS[opportunity.action];
              return (
                <Card key={opportunity.action} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {opportunity.icon}
                        <Badge variant="outline" className="text-xs">
                          {opportunity.category}
                        </Badge>
                      </div>
                      <Badge 
                        variant={opportunity.status === 'high-reward' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        +{reward.amount} TXC
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{reward.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Cooldown:</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reward.cooldownMinutes ? `${reward.cooldownMinutes}m` : 'None'}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleManualClaim(opportunity.action)}
                        disabled={isProcessing}
                        className="w-full"
                        size="sm"
                      >
                        {isProcessing ? 'Processing...' : 'Mine TXC'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Mining Potential</CardTitle>
                <CardDescription>
                  Maximum TXC you can earn per day through activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Daily Potential:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      +{formatTXC(totalPossibleDaily)}
                    </Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete all daily activities to maximize your earnings
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {Object.entries(TXC_MINING_REWARDS).map(([action, reward]) => (
                <Card key={action} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{reward.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        Cooldown: {reward.cooldownMinutes ? `${reward.cooldownMinutes} minutes` : 'None'}
                      </p>
                    </div>
                    <Badge variant="outline">+{reward.amount} TXC</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mining Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Today's Earnings:</span>
                  <span className="font-semibold">+{formatTXC(450)}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-semibold">+{formatTXC(2850)}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-semibold">+{formatTXC(12400)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Posts Created:</span>
                  <span>8 (+1,200 TXC)</span>
                </div>
                <div className="flex justify-between">
                  <span>Connections Made:</span>
                  <span>12 (+900 TXC)</span>
                </div>
                <div className="flex justify-between">
                  <span>Jobs Applied:</span>
                  <span>5 (+450 TXC)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bonuses">
          <div className="grid gap-4">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-600" />
                  Special Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Weekly Social Activity Bonus</span>
                    <Badge className="bg-yellow-100 text-yellow-800">+300 TXC</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active for 7 consecutive days
                  </p>
                </div>
                
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Referral Bonus</span>
                    <Badge className="bg-green-100 text-green-800">+1,000 TXC</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Per successful referral
                  </p>
                </div>

                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Welcome Bonus</span>
                    <Badge className="bg-blue-100 text-blue-800">+500 TXC</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    One-time joining bonus
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};