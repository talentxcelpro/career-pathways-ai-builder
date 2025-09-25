import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, ChevronRight, Timer } from 'lucide-react';

interface TXCCoinBalanceProps {
  balance: number;
  level?: number;
  title?: string;
  compact?: boolean;
}

export const TXCCoinBalance: React.FC<TXCCoinBalanceProps> = ({ 
  balance, 
  level = 4, 
  title = "Expert",
  compact = false 
}) => {
  // Calculate next level requirements
  const currentLevelMin = level * 250;
  const nextLevelMin = (level + 1) * 250;
  const progressToNext = balance - currentLevelMin;
  const totalNeededForNext = nextLevelMin - currentLevelMin;
  const progressPercentage = Math.min((progressToNext / totalNeededForNext) * 100, 100);
  const coinsToNext = Math.max(0, nextLevelMin - balance);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-2 rounded-full">
        <Award className="h-4 w-4" />
        <span className="font-bold">{balance.toLocaleString()} TXC</span>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
          L{level}
        </Badge>
      </div>
    );
  }

  // Match the exact design from the image
  return (
    <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div className="p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <div className="relative flex items-center justify-between">
          {/* Left side - Icon and coins */}
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Timer className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <div className="text-3xl font-bold mb-1">
                {balance.toLocaleString()} TXC
              </div>
              <div className="text-white/90 text-sm font-medium">
                {title} • {coinsToNext > 0 ? `${coinsToNext} to next level` : 'Max level!'}
              </div>
            </div>
          </div>
          
          {/* Right side - Level badge and arrow */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <Badge 
                variant="secondary" 
                className="bg-white/25 text-white border-0 text-sm px-3 py-1 backdrop-blur-sm font-bold"
              >
                Level<br/>{level}
              </Badge>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="h-5 w-5 text-white/80" />
              <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Progress bar for next level */}
        {coinsToNext > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
              <div 
                className="bg-white/60 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick earning indicators */}
        <div className="flex gap-2 mt-3 text-xs">
          <div className="bg-white/15 px-2 py-1 rounded backdrop-blur-sm">+10 Apply</div>
          <div className="bg-white/15 px-2 py-1 rounded backdrop-blur-sm">+5 Save</div>
          <div className="bg-white/15 px-2 py-1 rounded backdrop-blur-sm">+15 Interview</div>
        </div>
      </div>
    </Card>
  );
};