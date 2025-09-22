import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Zap,
  Crown,
  Star,
  Gift,
  Sparkles,
  Eye,
  Lock,
  Timer,
  Target,
  Award,
  Rocket,
  ChevronRight,
  Trophy
} from 'lucide-react';

interface ComingSoonFeature {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  category: string;
  icon: React.ReactNode;
  benefits: string[];
  launchDate: string;
  earlyAccess?: boolean;
}

export const TXCEnhancedBalance: React.FC = () => {
  const { availableBalance, lifetimeEarned, isLoading } = useTokenBalance();
  const { getAllRewards } = useTXCMining();
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<ComingSoonFeature | null>(null);

  // Calculate user level based on lifetime earnings
  const userLevel = Math.floor(lifetimeEarned / 1000) + 1;
  const currentLevelProgress = (lifetimeEarned % 1000) / 1000 * 100;
  const nextLevelTXC = 1000 - (lifetimeEarned % 1000);

  // Coming Soon Features based on your pricing structure
  const comingSoonFeatures: ComingSoonFeature[] = [
    {
      id: 'premium_skill_tests',
      name: 'Premium Skill Tests & Certifications',
      description: 'Advanced assessments with industry-recognized certificates',
      estimatedCost: 2500,
      category: 'certification',
      icon: <Award className="h-5 w-5" />,
      benefits: ['Industry Certificates', 'Skill Validation', 'Profile Boost'],
      launchDate: 'Q1 2025',
      earlyAccess: true
    },
    {
      id: 'resume_profile_boost',
      name: 'Resume/Profile Boosts',
      description: 'Appear at the top of recruiter searches for 30 days',
      estimatedCost: 1500,
      category: 'visibility',
      icon: <TrendingUp className="h-5 w-5" />,
      benefits: ['Top Search Results', '5x Visibility', 'Priority Placement'],
      launchDate: 'Q1 2025'
    },
    {
      id: 'recruiter_tools',
      name: 'Recruiter Tools Unlock',
      description: 'Access candidate contacts and premium job posting features',
      estimatedCost: 5000,
      category: 'tools',
      icon: <Eye className="h-5 w-5" />,
      benefits: ['Candidate Contacts', 'Large-scale Assessments', 'Premium Postings'],
      launchDate: 'Q2 2025'
    },
    {
      id: 'learning_modules',
      name: 'Premium Learning & Mentorship',
      description: 'Exclusive learning content and 1-on-1 mentorship sessions',
      estimatedCost: 3000,
      category: 'learning',
      icon: <Sparkles className="h-5 w-5" />,
      benefits: ['Expert Mentorship', 'Premium Courses', 'Career Guidance'],
      launchDate: 'Q1 2025'
    },
    {
      id: 'staking_rewards',
      name: 'TXC Staking Program',
      description: 'Stake TXC for extra visibility, badges, and passive rewards',
      estimatedCost: 1000,
      category: 'staking',
      icon: <Target className="h-5 w-5" />,
      benefits: ['Passive Rewards', 'Exclusive Badges', 'Bonus Visibility'],
      launchDate: 'Q2 2025',
      earlyAccess: true
    },
    {
      id: 'referral_bonuses',
      name: 'Enhanced Referral System',
      description: 'Earn and redeem referral bonuses for premium features',
      estimatedCost: 500,
      category: 'rewards',
      icon: <Gift className="h-5 w-5" />,
      benefits: ['Referral Rewards', 'Bonus Multipliers', 'Friend Benefits'],
      launchDate: 'Q1 2025'
    }
  ];

  const totalEarningPotential = getAllRewards().reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-200/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 opacity-50" />
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  TXC Wallet
                </span>
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                Level {userLevel}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6">
            {/* Main Balance Display */}
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Coins className="h-8 w-8 text-amber-600" />
                    <span className="text-4xl font-bold text-amber-700 dark:text-amber-400">
                      {isLoading ? '...' : availableBalance.toLocaleString()}
                    </span>
                    <span className="text-xl font-semibold text-amber-600">TXC</span>
                  </div>
                  <p className="text-sm text-amber-600/80">Available Balance</p>
                  
                  {/* Live Price Teaser */}
                  <motion.div 
                    className="mt-3 px-3 py-1 bg-amber-50/50 dark:bg-amber-900/10 rounded-full border border-amber-200/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                      💰 <strong>Current Rate:</strong> ₹1 = 1 TXC • <span className="text-green-600">Exchange Coming Soon!</span>
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-200/30">
                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {lifetimeEarned.toLocaleString()}
                </p>
                <p className="text-xs text-green-600/80">Lifetime Earned</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30">
                <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {nextLevelTXC.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600/80">To Next Level</p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-700 dark:text-amber-400">Level {userLevel} Progress</span>
                <span className="text-amber-600">{Math.round(currentLevelProgress)}%</span>
              </div>
              <Progress value={currentLevelProgress} className="h-2 bg-amber-100 dark:bg-amber-900/20" />
              <p className="text-xs text-amber-600/80 text-center">
                Complete activities to level up and unlock more earning potential!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={() => navigate('/gamification')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Earn More TXC
              </Button>
              
              <Button 
                variant="outline"
                className="border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => setShowComingSoon(!showComingSoon)}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Coming Soon Features */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Upcoming TXC Features
                  <Badge variant="secondary" className="ml-2">Preview</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get ready for exciting new ways to use your TXC tokens!
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comingSoonFeatures.map((feature) => (
                    <motion.div
                      key={feature.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      {feature.earlyAccess && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            Early Access
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{feature.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-amber-500" />
                            <span className="font-bold text-amber-600">
                              ~{feature.estimatedCost.toLocaleString()} TXC
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {feature.launchDate}
                          </Badge>
                        </div>

                        {/* Affordability Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Your Progress</span>
                            <span className={`${availableBalance >= feature.estimatedCost ? 'text-green-600' : 'text-amber-600'}`}>
                              {Math.min(Math.round((availableBalance / feature.estimatedCost) * 100), 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((availableBalance / feature.estimatedCost) * 100, 100)} 
                            className="h-1.5" 
                          />
                          {availableBalance >= feature.estimatedCost ? (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Ready to purchase when available!
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Need {(feature.estimatedCost - availableBalance).toLocaleString()} more TXC
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {feature.launchDate}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* TXC Purchase Packages Preview */}
                <motion.div 
                  className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Future TXC Purchase Options
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
                      <p className="font-semibold text-sm">Starter Pack</p>
                      <p className="text-xs text-muted-foreground">₹99 → 100 TXC</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
                      <p className="font-semibold text-sm">Growth Pack</p>
                      <p className="text-xs text-muted-foreground">₹499 → 600 TXC</p>
                      <Badge variant="secondary" className="mt-1 text-xs">+20% Bonus</Badge>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
                      <p className="font-semibold text-sm">Pro Pack</p>
                      <p className="text-xs text-muted-foreground">₹999 → 1,300 TXC</p>
                      <Badge variant="secondary" className="mt-1 text-xs">+30% Bonus</Badge>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
                      <p className="font-semibold text-sm">Enterprise</p>
                      <p className="text-xs text-muted-foreground">Custom Pricing</p>
                      <Badge className="mt-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        10K+ TXC
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Purchase options will be available once the platform grows and features are launched
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Earning Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Earning Potential
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Maximum TXC Available Today</span>
              <span className="font-bold text-primary">{totalEarningPotential.toLocaleString()} TXC</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Earning Progress</span>
                <span>{Math.round((lifetimeEarned / totalEarningPotential) * 100)}%</span>
              </div>
              <Progress value={(lifetimeEarned / totalEarningPotential) * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/gamification?tab=mining')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Start Mining
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/gamification?tab=achievements')}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                View Achievements
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};