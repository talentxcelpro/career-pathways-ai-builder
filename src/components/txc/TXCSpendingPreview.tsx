import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import {
  Coins,
  Lock,
  Star,
  Award,
  TrendingUp,
  Eye,
  BookOpen,
  Target,
  Gift,
  Crown,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react';

interface SpendingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  items: Array<{
    name: string;
    cost: number;
    description: string;
    launchDate: string;
    popular?: boolean;
  }>;
  totalValue: number;
}

export const TXCSpendingPreview: React.FC = () => {
  const { availableBalance } = useTokenBalance();

  const spendingCategories: SpendingCategory[] = [
    {
      id: 'certifications',
      name: 'Skill Tests & Certifications',
      description: 'Industry-recognized certificates and skill validations',
      icon: <Award className="h-6 w-6" />,
      items: [
        {
          name: 'Technical Skill Assessment',
          cost: 1500,
          description: 'Comprehensive technical evaluation with certificate',
          launchDate: 'Q1 2025',
          popular: true
        },
        {
          name: 'Soft Skills Certification',
          cost: 1000,
          description: 'Leadership and communication skills validation',
          launchDate: 'Q1 2025'
        },
        {
          name: 'Industry Expert Certification',
          cost: 3000,
          description: 'Domain-specific expert-level certification',
          launchDate: 'Q2 2025'
        }
      ],
      totalValue: 5500
    },
    {
      id: 'visibility',
      name: 'Profile & Resume Boosts',
      description: 'Enhanced visibility and recruiter attention',
      icon: <TrendingUp className="h-6 w-6" />,
      items: [
        {
          name: '7-Day Profile Boost',
          cost: 500,
          description: 'Appear at top of recruiter searches for a week',
          launchDate: 'Q1 2025',
          popular: true
        },
        {
          name: '30-Day Premium Visibility',
          cost: 1500,
          description: 'Extended premium placement and highlighting',
          launchDate: 'Q1 2025'
        },
        {
          name: 'Featured Profile Badge',
          cost: 800,
          description: 'Special badge showing profile quality',
          launchDate: 'Q1 2025'
        }
      ],
      totalValue: 2800
    },
    {
      id: 'tools',
      name: 'Recruiter & Advanced Tools',
      description: 'Professional networking and recruitment features',
      icon: <Eye className="h-6 w-6" />,
      items: [
        {
          name: 'Direct Candidate Contact',
          cost: 2000,
          description: 'Access contact information of top candidates',
          launchDate: 'Q2 2025'
        },
        {
          name: 'Bulk Assessment Tools',
          cost: 3500,
          description: 'Large-scale candidate evaluation system',
          launchDate: 'Q2 2025'
        },
        {
          name: 'Premium Job Posting',
          cost: 1200,
          description: 'Enhanced job posting with better reach',
          launchDate: 'Q1 2025'
        }
      ],
      totalValue: 6700
    },
    {
      id: 'learning',
      name: 'Learning & Mentorship',
      description: 'Exclusive educational content and guidance',
      icon: <BookOpen className="h-6 w-6" />,
      items: [
        {
          name: 'Premium Course Access',
          cost: 2500,
          description: 'Unlock all premium learning modules',
          launchDate: 'Q1 2025',
          popular: true
        },
        {
          name: '1-on-1 Mentorship Session',
          cost: 4000,
          description: 'Personal guidance from industry experts',
          launchDate: 'Q1 2025'
        },
        {
          name: 'Career Coaching Program',
          cost: 8000,
          description: 'Comprehensive 3-month coaching program',
          launchDate: 'Q2 2025'
        }
      ],
      totalValue: 14500
    },
    {
      id: 'rewards',
      name: 'Staking & Rewards',
      description: 'Passive earning and exclusive benefits',
      icon: <Target className="h-6 w-6" />,
      items: [
        {
          name: 'TXC Staking Pool',
          cost: 1000,
          description: 'Stake TXC for passive rewards and bonuses',
          launchDate: 'Q2 2025',
          popular: true
        },
        {
          name: 'VIP Member Badge',
          cost: 2500,
          description: 'Exclusive member benefits and recognition',
          launchDate: 'Q1 2025'
        },
        {
          name: 'Referral Multiplier',
          cost: 1500,
          description: 'Boost your referral rewards by 2x',
          launchDate: 'Q1 2025'
        }
      ],
      totalValue: 5000
    }
  ];

  const totalSpendingPotential = spendingCategories.reduce((sum, cat) => sum + cat.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          TXC Spending Preview
        </h2>
        <p className="text-muted-foreground">
          Get ready for exciting ways to use your TXC tokens
        </p>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Coming Soon • Q1-Q2 2025
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{availableBalance.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Your Current TXC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{totalSpendingPotential.toLocaleString()}</p>
            <p className="text-sm text-green-600">Total Spending Options</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200/50">
          <CardContent className="p-6 text-center">
            <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">
              {Math.round((availableBalance / totalSpendingPotential) * 100)}%
            </p>
            <p className="text-sm text-purple-600">Purchasing Power</p>
          </CardContent>
        </Card>
      </div>

      {/* Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {spendingCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {category.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Category Value */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Category Value</span>
                  <Badge variant="outline" className="font-bold">
                    {category.totalValue.toLocaleString()} TXC
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const canAfford = availableBalance >= item.cost;
                    const progressPercent = Math.min((availableBalance / item.cost) * 100, 100);

                    return (
                      <motion.div
                        key={item.name}
                        className="p-3 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              {item.popular && (
                                <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <Badge variant={canAfford ? "default" : "secondary"} className="ml-2">
                            {item.cost.toLocaleString()} TXC
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Your Progress</span>
                            <span className={canAfford ? 'text-green-600' : 'text-muted-foreground'}>
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                          {!canAfford && (
                            <p className="text-xs text-muted-foreground">
                              Need {(item.cost - availableBalance).toLocaleString()} more TXC
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {item.launchDate}
                          </div>
                          {canAfford ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                              Ready!
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Keep Earning
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Start Earning TXC Today!</h3>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The more TXC you earn now, the more premium features you'll be able to unlock when they launch. 
          Every career activity gets you closer to these amazing benefits.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
            <Sparkles className="h-5 w-5 mr-2" />
            Start Earning TXC
          </Button>
          <Button size="lg" variant="outline">
            <Users className="h-5 w-5 mr-2" />
            Share with Friends
          </Button>
        </div>
      </motion.div>
    </div>
  );
};