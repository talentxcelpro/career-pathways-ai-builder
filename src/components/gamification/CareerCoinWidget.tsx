import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Zap, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNavigate } from 'react-router-dom';

export const CareerCoinWidget = () => {
  const { availableBalance, isLoading } = useTokenBalance();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-200/20 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* TXC Wallet Header */}
          <motion.div 
            className="text-center mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                TXC Wallet
              </h2>
              <Coins className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your token balance and earnings
            </p>
          </motion.div>

          {/* TXC Balance Display */}
          <motion.div 
            className="text-center mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins className="h-6 w-6 text-amber-600" />
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {isLoading ? '...' : availableBalance.toLocaleString()}
                  </span>
                  <span className="text-lg font-semibold text-amber-600">TXC</span>
                </div>
                <p className="text-xs text-amber-600/80">Available Balance</p>
              </div>
            </div>
          </motion.div>

          {/* Career Progress Indicators */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-700 dark:text-green-400">Career Growth</p>
              <p className="text-xs text-green-600/80">+TXC</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Achievements</p>
              <p className="text-xs text-blue-600/80">+TXC</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200/50"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Activities</p>
              <p className="text-xs text-purple-600/80">+TXC</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              onClick={() => navigate('/gamification')}
            >
              <Coins className="h-4 w-4 mr-2" />
              Visit Mining Center
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/gamification?tab=marketplace')}
              >
                Spend TXC
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/gamification?tab=achievements')}
              >
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
              💰 <strong>Earn TXC tokens for every career action.</strong> Complete your profile, apply to jobs, connect with professionals, learn new skills - all activities reward you with TXC tokens for premium features.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};