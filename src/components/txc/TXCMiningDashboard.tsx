import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, Clock, CheckCircle, Trophy, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { useTXCMining, TXC_MINING_REWARDS } from '@/hooks/useTXCMining';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useDailyLoginBonus } from '@/hooks/useDailyLoginBonus';
import { formatTXC } from '@/types/txc-pricing';
import txcMascot from '@/assets/txc-mascot.jpg';

export const TXCMiningDashboard: React.FC = () => {
  const { earnTXC, canEarnReward, getAllRewards, getAvailableActions, isProcessing } = useTXCMining();
  const { availableBalance, lifetimeEarned } = useTokenBalance();
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  
  // Initialize daily login bonus system
  useDailyLoginBonus();

  useEffect(() => {
    const fetchAvailableActions = async () => {
      const actions = await getAvailableActions();
      setAvailableActions(actions);
    };
    fetchAvailableActions();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAvailableActions, 30000);
    return () => clearInterval(interval);
  }, [getAvailableActions]);

  const handleEarnTXC = async (action: string) => {
    setLoadingActions(prev => ({ ...prev, [action]: true }));
    
    try {
      await earnTXC(action);
      
      // Refresh available actions
      const actions = await getAvailableActions();
      setAvailableActions(actions);
    } finally {
      setLoadingActions(prev => ({ ...prev, [action]: false }));
    }
  };

  const allRewards = getAllRewards();
  const totalPossibleTXC = allRewards.reduce((sum, reward) => sum + reward.amount, 0);
  const currentProgress = (availableBalance / totalPossibleTXC) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available TXC</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {formatTXC(availableBalance)}
                </p>
                {availableBalance > 1000 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Great progress!</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Coins className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                <p className="text-2xl font-bold text-green-600">{formatTXC(lifetimeEarned)}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Actions</p>
                <p className="text-2xl font-bold text-blue-600">{availableActions.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mining Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Mining Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Level Progress</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete more activities to earn TXC and unlock features
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Available Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No actions available right now</p>
              <p className="text-sm">Come back later for more earning opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableActions.map((action) => {
                const reward = TXC_MINING_REWARDS[action];
                const isLoading = loadingActions[action];
                
                return (
                  <div key={action} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{reward.description}</h4>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +{formatTXC(reward.amount)}
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleEarnTXC(action)}
                      disabled={isLoading || isProcessing}
                      className="w-full"
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Earning...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Earn TXC
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Rewards Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            All Earning Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allRewards.map((reward) => {
              const isAvailable = availableActions.includes(reward.action);
              const cooldownHours = reward.cooldownMinutes ? Math.round(reward.cooldownMinutes / 60) : 0;
              
              return (
                <div 
                  key={reward.action}
                  className={`border rounded-lg p-3 ${isAvailable ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{reward.description}</span>
                    <Badge variant={isAvailable ? "default" : "secondary"}>
                      +{formatTXC(reward.amount)}
                    </Badge>
                  </div>
                  
                  {cooldownHours > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {cooldownHours < 24 ? `${cooldownHours}h cooldown` : `${Math.round(cooldownHours / 24)}d cooldown`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};