import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, TrendingUp, Gift, Zap, Star, Award, 
  ChevronRight, Sparkles, Target, Trophy
} from 'lucide-react';

interface TXCCoinBalanceProps {
  balance: number;
}

export const TXCCoinBalance: React.FC<TXCCoinBalanceProps> = ({ balance }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const recentEarnings = [
    { action: 'Job Application', coins: 10, time: '2 min ago' },
    { action: 'Profile Completion', coins: 25, time: '1 hour ago' },
    { action: 'Daily Login', coins: 5, time: '1 day ago' },
  ];

  const achievements = [
    { name: 'Job Hunter', requirement: 'Apply to 10 jobs', progress: 7, total: 10, reward: 50 },
    { name: 'Profile Master', requirement: 'Complete profile 100%', progress: 85, total: 100, reward: 100 },
    { name: 'Social Butterfly', requirement: 'Save 20 jobs', progress: 15, total: 20, reward: 30 },
  ];

  const getLevel = (coins: number) => {
    if (coins < 100) return { level: 1, name: 'Rookie', next: 100 };
    if (coins < 500) return { level: 2, name: 'Explorer', next: 500 };
    if (coins < 1000) return { level: 3, name: 'Hunter', next: 1000 };
    if (coins < 2500) return { level: 4, name: 'Expert', next: 2500 };
    return { level: 5, name: 'Master', next: 5000 };
  };

  const userLevel = getLevel(balance);

  return (
    <div className="relative">
      <Card 
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Coins className="h-6 w-6 text-white animate-pulse" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{balance.toLocaleString()}</span>
              <span className="text-sm font-medium">TXC</span>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                Level {userLevel.level}
              </Badge>
            </div>
            <div className="text-sm opacity-90">
              {userLevel.name} • {userLevel.next - balance} to next level
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-200" />
            <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </Card>

      {/* Expanded Panel */}
      {isExpanded && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border shadow-xl">
          <div className="p-6 space-y-6">
            
            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Level Progress</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  {userLevel.name}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((balance / userLevel.next) * 100, 100)}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {balance} / {userLevel.next} TXC coins
              </div>
            </div>

            {/* Recent Earnings */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Earnings</h3>
              <div className="space-y-2">
                {recentEarnings.map((earning, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{earning.action}</div>
                      <div className="text-xs text-muted-foreground">{earning.time}</div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <Coins className="h-4 w-4" />
                      +{earning.coins}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{achievement.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-bold text-sm">
                        <Coins className="h-3 w-3" />
                        {achievement.reward}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {achievement.requirement}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.progress} / {achievement.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm">
                <Gift className="h-4 w-4 mr-2" />
                Redeem Coins
              </Button>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                View Challenges
              </Button>
            </div>

            {/* Daily Bonus */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Daily Bonus Available!</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete your daily check-in to earn bonus TXC coins
                </p>
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                  <Zap className="h-4 w-4 mr-2" />
                  Claim Daily Bonus (+20 TXC)
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};