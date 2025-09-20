import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNavigate } from 'react-router-dom';

export const GlobalTXCBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { availableBalance } = useTokenBalance();
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative z-50 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Coins className="h-6 w-6 text-white" />
              </motion.div>
              
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/90" />
                <span className="text-white font-semibold text-sm">
                  Your Career is Your Coin
                </span>
                <span className="text-white/90 text-sm">•</span>
                <span className="text-white/90 text-sm">
                  Balance: <span className="font-bold">{availableBalance.toLocaleString()} TXC</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                onClick={() => navigate('/gamification')}
              >
                Earn More
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-100, 500] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};