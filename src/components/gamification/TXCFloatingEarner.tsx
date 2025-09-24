import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Coins, 
  Zap, 
  Star, 
  Trophy, 
  Flame,
  Target,
  Gift,
  Sparkles
} from 'lucide-react';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FloatingReward {
  id: string;
  amount: number;
  action: string;
  timestamp: number;
  x: number;
  y: number;
}

export const TXCFloatingEarner: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableBalance, refreshBalance } = useTokenBalance();
  const txcIntegration = useTXCIntegration();
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Auto-earning activities every 5-10 minutes for realistic earning
  useEffect(() => {
    if (!user || !isActive) return;

    const autoEarnInterval = setInterval(async () => {
      const random = Math.random();
      let action = '';
      let shouldEarn = false;

      // Reduced chances for more realistic earning
      if (random > 0.95) {
        action = 'daily_login';
        shouldEarn = true;
      } else if (random > 0.90) {
        action = 'post_liked';
        shouldEarn = true;
      } else if (random > 0.85) {
        action = 'social_activity_bonus';
        shouldEarn = true;
      }

      if (shouldEarn && action) {
        const earned = await txcIntegration.earnTXC(action);
        if (earned) {
          addFloatingReward(action);
          refreshBalance();
        }
      }
    }, Math.random() * 300000 + 300000); // 5-10 minutes

    return () => clearInterval(autoEarnInterval);
  }, [user, isActive, txcIntegration, refreshBalance]);

  const addFloatingReward = (action: string) => {
    const reward: FloatingReward = {
      id: Date.now().toString(),
      amount: getActionAmount(action),
      action,
      timestamp: Date.now(),
      x: Math.random() * 200,
      y: Math.random() * 100
    };

    setFloatingRewards(prev => [...prev, reward]);

    // Remove after animation
    setTimeout(() => {
      setFloatingRewards(prev => prev.filter(r => r.id !== reward.id));
    }, 3000);
  };

  const getActionAmount = (action: string): number => {
    const amounts: Record<string, number> = {
      'daily_login': 75,
      'post_liked': 20,
      'comment_made': 20,
      'social_activity_bonus': 300,
      'profile_completed': 300,
      'connection_made': 75,
      'course_completed': 600
    };
    return amounts[action] || 50;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'daily_login': return <Star className="h-4 w-4" />;
      case 'post_liked': return <Flame className="h-4 w-4" />;
      case 'social_activity_bonus': return <Trophy className="h-4 w-4" />;
      case 'course_completed': return <Target className="h-4 w-4" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const quickEarnActions = [
    { key: 'post_liked', label: 'Like Posts', icon: Flame, amount: 20 },
    { key: 'comment_made', label: 'Comment', icon: Star, amount: 20 },
    { key: 'connection_made', label: 'Connect', icon: Target, amount: 75 },
    { key: 'profile_completed', label: 'Update Profile', icon: Trophy, amount: 300 }
  ];

  const handleQuickEarn = async (action: string) => {
    const earned = await txcIntegration.earnTXC(action);
    if (earned) {
      addFloatingReward(action);
      refreshBalance();
      toast({
        title: "TXC Earned! 🎉",
        description: `+${getActionAmount(action)} TXC for ${action.replace('_', ' ')}`,
      });
    } else {
      toast({
        title: "Cooldown Active ⏰",
        description: "Please wait before earning TXC from this action again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      {/* Floating Rewards */}
      {floatingRewards.map((reward) => (
        <div
          key={reward.id}
          className="absolute pointer-events-none z-50 animate-bounce"
          style={{
            left: `${reward.x}px`,
            top: `${reward.y}px`,
            animation: 'float-up 3s ease-out forwards'
          }}
        >
          <Badge className="bg-green-500 text-white border-0 shadow-lg">
            <Coins className="h-3 w-3 mr-1" />
            +{reward.amount} TXC
          </Badge>
        </div>
      ))}

      {/* Live TXC Balance */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {availableBalance?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-green-700">Live TXC Balance</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className={isActive ? 'text-green-600' : 'text-gray-400'}
            >
              {isActive ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Auto-Earning
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Paused
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Earn Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Quick Earn TXC</h3>
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickEarnActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  variant="outline"
                  onClick={() => handleQuickEarn(action.key)}
                  className="h-16 flex-col gap-1 hover:bg-green-50 hover:border-green-200"
                >
                  <Icon className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-medium">{action.label}</span>
                  <Badge className="text-xs bg-green-100 text-green-800 border-0">
                    +{action.amount}
                  </Badge>
                </Button>
              );
            })}
          </div>

        </CardContent>
      </Card>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};