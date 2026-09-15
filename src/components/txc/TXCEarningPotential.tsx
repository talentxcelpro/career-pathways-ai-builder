import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining, TXC_MINING_REWARDS } from '@/hooks/useTXCMining';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Clock,
  Star,
  Zap,
  Calendar,
  Award,
  ChevronRight,
  BarChart3,
  Coins,
  Timer,
  CheckCircle
} from 'lucide-react';

interface EarningOpportunity {
  category: string;
  actions: Array<{
    action: string;
    reward: number;
    description: string;
    cooldown: number;
    frequency: string;
  }>;
  totalPotential: number;
}

export const TXCEarningPotential: React.FC = () => {
  const { availableBalance, lifetimeEarned } = useTokenBalance();
  const { getAllRewards, getAvailableActions, earnTXC } = useTXCMining();
  const navigate = useNavigate();
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchAvailable = async () => {
      const actions = await getAvailableActions();
      setAvailableActions(actions);
    };
    fetchAvailable();
  }, [getAvailableActions]);

  // Categorize earning opportunities
  const earningOpportunities: EarningOpportunity[] = [
    {
      category: 'Daily Activities',
      actions: [
        {
          action: 'daily_login',
          reward: TXC_MINING_REWARDS.daily_login.amount,
          description: 'Daily login bonus',
          cooldown: 1440,
          frequency: 'Daily'
        },
        {
          action: 'post_created',
          reward: TXC_MINING_REWARDS.post_created.amount,
          description: 'Create a post',
          cooldown: 60,
          frequency: 'Hourly'
        },
        {
          action: 'comment_made',
          reward: TXC_MINING_REWARDS.comment_made.amount,
          description: 'Comment on posts',
          cooldown: 10,
          frequency: 'Every 10 min'
        }
      ],
      totalPotential: 0
    },
    {
      category: 'Career Activities',
      actions: [
        {
          action: 'job_applied',
          reward: TXC_MINING_REWARDS.job_applied.amount,
          description: 'Apply to jobs',
          cooldown: 60,
          frequency: 'Hourly'
        },
        {
          action: 'resume_created',
          reward: TXC_MINING_REWARDS.resume_created.amount,
          description: 'Create/update resume',
          cooldown: 240,
          frequency: 'Every 4h'
        },
        {
          action: 'profile_completed',
          reward: TXC_MINING_REWARDS.profile_completed.amount,
          description: 'Complete profile',
          cooldown: 1440,
          frequency: 'Daily'
        }
      ],
      totalPotential: 0
    },
    {
      category: 'Social & Learning',
      actions: [
        {
          action: 'connection_made',
          reward: TXC_MINING_REWARDS.connection_made.amount,
          description: 'Connect with professionals',
          cooldown: 30,
          frequency: 'Every 30 min'
        },
        {
          action: 'course_completed',
          reward: TXC_MINING_REWARDS.course_completed.amount,
          description: 'Complete courses',
          cooldown: 60,
          frequency: 'Hourly'
        },
        {
          action: 'recommendation_given',
          reward: TXC_MINING_REWARDS.recommendation_given.amount,
          description: 'Give recommendations',
          cooldown: 120,
          frequency: 'Every 2h'
        }
      ],
      totalPotential: 0
    },
    {
      category: 'Special Rewards',
      actions: [
        {
          action: 'social_activity_bonus',
          reward: TXC_MINING_REWARDS.social_activity_bonus.amount,
          description: 'Weekly social bonus',
          cooldown: 10080,
          frequency: 'Weekly'
        },
        {
          action: 'referral_made',
          reward: TXC_MINING_REWARDS.referral_made.amount,
          description: 'Refer new users',
          cooldown: 0,
          frequency: 'Unlimited'
        },
        {
          action: 'article_posted',
          reward: TXC_MINING_REWARDS.article_posted.amount,
          description: 'Write articles',
          cooldown: 240,
          frequency: 'Every 4h'
        }
      ],
      totalPotential: 0
    }
  ];

  // Calculate potential earnings
  earningOpportunities.forEach(category => {
    category.totalPotential = category.actions.reduce((sum, action) => {
      // Calculate daily potential based on cooldown
      let dailyOccurrences = 1;
      if (action.cooldown > 0) {
        dailyOccurrences = Math.floor(1440 / action.cooldown); // 1440 minutes in a day
      }
      return sum + (action.reward * Math.min(dailyOccurrences, 10)); // Cap at 10 times per day
    }, 0);
  });

  const totalDailyPotential = earningOpportunities.reduce((sum, cat) => sum + cat.totalPotential, 0);
  const currentDailyEarnings = Math.min(lifetimeEarned, totalDailyPotential);
  const efficiencyPercentage = (currentDailyEarnings / totalDailyPotential) * 100;

  const filteredOpportunities = selectedCategory === 'all' 
    ? earningOpportunities 
    : earningOpportunities.filter(cat => cat.category.toLowerCase().includes(selectedCategory));

  const quickEarnAction = async (action: string) => {
    await earnTXC(action);
    // Refresh available actions
    const actions = await getAvailableActions();
    setAvailableActions(actions);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Daily Potential</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {totalDailyPotential.toLocaleString()} TXC
                </p>
                <p className="text-xs text-green-600/80">Maximum per day</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Your Efficiency</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {Math.round(efficiencyPercentage)}%
                </p>
                <p className="text-xs text-blue-600/80">Of daily potential</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Available Now</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {availableActions.length}
                </p>
                <p className="text-xs text-purple-600/80">Ready to earn</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {availableActions.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Earn Actions
              <Badge className="bg-primary/10 text-primary">
                {availableActions.length} Available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableActions.slice(0, 6).map((action) => {
                const reward = TXC_MINING_REWARDS[action];
                if (!reward) return null;
                
                return (
                  <motion.div
                    key={action}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => quickEarnAction(action)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{reward.description}</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +{reward.amount} TXC
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Coins className="h-3 w-3 mr-1" />
                      Earn Now
                    </Button>
                  </motion.div>
                );
              })}
            </div>
            
            {availableActions.length > 6 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/gamification?tab=mining')}
                >
                  View All {availableActions.length} Actions
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </Button>
        {earningOpportunities.map(category => (
          <Button
            key={category.category}
            size="sm"
            variant={selectedCategory === category.category.toLowerCase() ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.category.toLowerCase())}
          >
            {category.category}
          </Button>
        ))}
      </div>

      {/* Earning Opportunities by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.category}</CardTitle>
                <Badge variant="outline" className="text-primary border-primary">
                  {category.totalPotential.toLocaleString()} TXC/day
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.actions.map((actionItem, index) => {
                  const isAvailable = availableActions.includes(actionItem.action);
                  
                  return (
                    <motion.div
                      key={actionItem.action}
                      className={`p-3 rounded-lg border transition-all ${
                        isAvailable 
                          ? 'border-primary/30 bg-primary/5' 
                          : 'border-border bg-muted/30'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Timer className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{actionItem.description}</span>
                        </div>
                        <Badge variant={isAvailable ? "default" : "secondary"}>
                          +{actionItem.reward} TXC
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {actionItem.frequency}
                        </span>
                        {isAvailable ? (
                          <span className="text-green-600 font-medium">Available now!</span>
                        ) : (
                          <span>Cooldown active</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category Potential</span>
                  <span className="font-semibold">{category.totalPotential.toLocaleString()} TXC/day</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Efficiency Improvement Tips */}
      <Card className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Maximize Your Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Daily Consistency</p>
                <p className="text-xs text-muted-foreground">
                  Log in daily and complete regular activities for maximum TXC earning
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Complete Your Profile</p>
                <p className="text-xs text-muted-foreground">
                  A complete profile unlocks bonus TXC and better earning opportunities
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Weekly Goals</p>
                <p className="text-xs text-muted-foreground">
                  Set weekly TXC earning goals to stay motivated and track progress
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t flex gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              Complete Profile
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/gamification')}
              className="flex-1"
            >
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};