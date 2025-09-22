import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp } from 'lucide-react';

/**
 * Prominent indicator showing TXC is the only currency that matters
 */
export const TXCOnlyIndicator: React.FC<{ 
  className?: string;
  variant?: 'default' | 'compact' | 'banner';
}> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <Coins className="h-6 w-6" />
          <div className="text-center">
            <h3 className="font-bold text-lg">TXC - The Only Currency That Matters</h3>
            <p className="text-sm opacity-90">All services, features, and transactions powered by TalentXcel Coins</p>
          </div>
          <TrendingUp className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge className={`bg-green-600 hover:bg-green-700 text-white ${className}`}>
        <Coins className="h-3 w-3 mr-1" />
        TXC Only
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-green-600 rounded-full">
          <Coins className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-green-800">TXC Powered Platform</p>
          <p className="text-sm text-green-600">Experience the future of digital value</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          ₹1 = 1 TXC = $0.012
        </Badge>
        <span className="text-xs text-green-600 font-medium">Trading Q2 2025</span>
      </div>
    </div>
  );
};