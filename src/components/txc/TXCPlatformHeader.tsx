import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Zap } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';

/**
 * TXC Platform Header - Clean application-inspired design
 */
export const TXCPlatformHeader: React.FC = () => {
  const { availableBalance } = useTokenBalance();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* TXC Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-primary-light rounded-xl">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">TXC Platform</h1>
              <p className="text-xs text-muted-foreground">Blockchain-Powered Career Solutions</p>
            </div>
          </div>
        </div>

        {/* TXC Balance Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                <Zap className="h-3 w-3 mr-1" />
                {availableBalance.toLocaleString()} TXC
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(availableBalance * 0.012).toFixed(2)} USD
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};