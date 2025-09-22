import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Zap, Trophy, Star, Rocket, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNavigate } from 'react-router-dom';
import { TXCEnhancedBalance } from '@/components/txc/TXCEnhancedBalance';

export const CareerCoinWidget = () => {
  const { availableBalance, lifetimeEarned, isLoading } = useTokenBalance();
  const navigate = useNavigate();
  const [showEnhanced, setShowEnhanced] = useState(false);

  // Calculate user level and next milestone
  const userLevel = Math.floor(lifetimeEarned / 1000) + 1;
  const nextMilestone = userLevel * 1000;
  const progressToNext = ((lifetimeEarned % 1000) / 1000) * 100;

  if (showEnhanced) {
    return <TXCEnhancedBalance />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-200/20 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 opacity-50" />
        <CardContent className="p-6 relative z-10">
          {/* TXC Wallet Header */}
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                TXC Wallet
              </h2>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Level {userLevel}
            </Badge>
          </motion.div>

          {/* Enhanced Balance Display */}
          <motion.div 
            className="text-center mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-200/50">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="h-7 w-7 text-amber-600" />
                  <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    {isLoading ? '...' : availableBalance.toLocaleString()}
                  </span>
                  <span className="text-lg font-semibold text-amber-600">TXC</span>
                </div>
                <p className="text-xs text-amber-600/80 mb-2">Available Balance</p>
                
                {/* Live Price Teaser */}
                <motion.div 
                  className="px-3 py-1 bg-amber-50/50 dark:bg-amber-900/10 rounded-full border border-amber-200/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                    💰 <strong>Current Rate:</strong> ₹1 = 1 TXC • <span className="text-green-600">Exchange Coming!</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Progress & Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-200/30">
              <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-700 dark:text-green-400">
                {lifetimeEarned.toLocaleString()}
              </p>
              <p className="text-xs text-green-600/80">Lifetime Earned</p>
            </div>
            
            <div className="text-center p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30">
              <Star className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {Math.round(progressToNext)}%
              </p>
              <p className="text-xs text-blue-600/80">To Level {userLevel + 1}</p>
            </div>
          </div>

          {/* Coming Soon Teaser */}
          <motion.div 
            className="mb-6 p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">Coming Soon</p>
              <Badge variant="secondary" className="text-xs">Q1 2025</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Gift className="h-3 w-3 text-purple-600" />
                <span>Premium Features</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-purple-600" />
                <span>Skill Certifications</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-purple-600" />
                <span>Profile Boosts</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-purple-600" />
                <span>Staking Rewards</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              onClick={() => navigate('/gamification')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Earn More TXC
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => setShowEnhanced(true)}
              >
                <Rocket className="h-4 w-4 mr-1" />
                Full View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/gamification?tab=achievements')}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Achievements
              </Button>
            </div>
          </div>

          {/* TXC Information */}
          <motion.div 
            className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-center text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              💰 <strong>Earn TXC for career activities!</strong> Soon you'll use TXC for premium features, certifications, and profile boosts. Keep earning now to be ready!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};