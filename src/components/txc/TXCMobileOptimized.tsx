import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Coins, Zap, TrendingUp, Award, Menu, Smartphone } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { TXCMiningDashboard } from './TXCMiningDashboard';
import { TXCLeaderboard } from './TXCLeaderboard';
import { TXCLiveActivity } from './TXCLiveActivity';

const TXCMobileOptimized: React.FC = () => {
  const isMobile = useIsMobile();
  const { balance, availableBalance, lifetimeEarned } = useTokenBalance();
  const { earnTXC, getAllRewards, isProcessing } = useTXCMining();
  const [activeTab, setActiveTab] = useState('overview');

  // Optimized reward calculations
  const availableRewards = useMemo(() => {
    return getAllRewards().slice(0, 3); // Show only top 3 for mobile
  }, [getAllRewards]);

  const quickStats = useMemo(() => [
    { 
      label: 'Available', 
      value: availableBalance.toLocaleString(), 
      icon: Coins,
      color: 'text-green-600' 
    },
    { 
      label: 'Lifetime', 
      value: lifetimeEarned.toLocaleString(), 
      icon: TrendingUp,
      color: 'text-blue-600' 
    },
    { 
      label: 'Rank', 
      value: '#42', 
      icon: Award,
      color: 'text-purple-600' 
    }
  ], [availableBalance, lifetimeEarned]);

  const handleQuickMining = async (action: string) => {
    await earnTXC(action);
  };

  if (!isMobile) {
    return (
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mining">Mining</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <DesktopOverview stats={quickStats} rewards={availableRewards} onQuickMining={handleQuickMining} isProcessing={isProcessing} />
          </TabsContent>
          
          <TabsContent value="mining">
            <TXCMiningDashboard />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <TXCLeaderboard />
          </TabsContent>
          
          <TabsContent value="activity">
            <TXCLiveActivity />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">TXC</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {availableBalance.toLocaleString()} TXC
            </Badge>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>TXC Menu</SheetTitle>
                </SheetHeader>
                <MobileMenu onTabChange={setActiveTab} activeTab={activeTab} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'overview' && (
          <MobileOverview 
            stats={quickStats} 
            rewards={availableRewards} 
            onQuickMining={handleQuickMining}
            isProcessing={isProcessing}
          />
        )}
        
        {activeTab === 'mining' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mining Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <TXCMiningDashboard />
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <TXCLeaderboard />
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <TXCLiveActivity />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Quick Actions */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <Card className="bg-background/95 backdrop-blur border-primary/20">
          <CardContent className="p-3">
            <div className="flex gap-2 overflow-x-auto">
              {availableRewards.map((reward, index) => (
                <Button
                  key={reward.action}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 text-xs"
                  disabled={isProcessing}
                  onClick={() => handleQuickMining(reward.action)}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  +{reward.amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MobileOverview: React.FC<{
  stats: any[];
  rewards: any[];
  onQuickMining: (action: string) => void;
  isProcessing: boolean;
}> = ({ stats, rewards, onQuickMining, isProcessing }) => (
  <div className="space-y-4">
    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-3">
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Mining Actions */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Mining
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rewards.map((reward) => (
          <Button
            key={reward.action}
            variant="outline"
            className="w-full justify-between"
            disabled={isProcessing}
            onClick={() => onQuickMining(reward.action)}
          >
            <span className="text-sm">{reward.description}</span>
            <Badge variant="secondary">+{reward.amount}</Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  </div>
);

const DesktopOverview: React.FC<{
  stats: any[];
  rewards: any[];
  onQuickMining: (action: string) => void;
  isProcessing: boolean;
}> = ({ stats, rewards, onQuickMining, isProcessing }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Stats */}
    <div className="lg:col-span-2 grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6 text-center">
            <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Mining
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rewards.map((reward) => (
          <Button
            key={reward.action}
            variant="outline"
            className="w-full justify-between"
            disabled={isProcessing}
            onClick={() => onQuickMining(reward.action)}
          >
            <span>{reward.description}</span>
            <Badge variant="secondary">+{reward.amount}</Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  </div>
);

const MobileMenu: React.FC<{
  onTabChange: (tab: string) => void;
  activeTab: string;
}> = ({ onTabChange, activeTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Coins },
    { id: 'mining', label: 'Mining', icon: Zap },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
  ];

  return (
    <div className="space-y-2 mt-6">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange(item.id)}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default TXCMobileOptimized;