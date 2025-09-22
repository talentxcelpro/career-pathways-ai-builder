import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';

/**
 * Navigation indicator showing TXC is the only currency
 */
export const TXCOnlyNavIndicator: React.FC = () => {
  const { availableBalance } = useTokenBalance();

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-green-600 rounded-full">
          <Coins className="h-3 w-3 text-white" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-green-800">TXC Only Platform</p>
          <p className="text-xs text-green-600">₹1 = 1 TXC</p>
        </div>
      </div>
      <Badge className="bg-green-600 text-white text-xs">
        {availableBalance.toLocaleString()} TXC
      </Badge>
    </div>
  );
};