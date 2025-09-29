import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
// TEMPORARILY DISABLED TXC - import { useTXCIntegration } from '@/hooks/useTXCIntegration';
// TEMPORARILY DISABLED TXC - import { useTokenBalance } from '@/hooks/useTokenBalance';

export const TXCTestButton: React.FC = () => {
  // TEMPORARILY DISABLED TXC - All TXC functionality disabled to prevent posting issues
  // const { triggerPostCreated } = useTXCIntegration();
  // const { balance, availableBalance, refreshBalance } = useTokenBalance();

  const handleTestTXC = async () => {
    console.log('TXC system temporarily disabled');
    // TEMPORARILY DISABLED TXC
    // const success = await triggerPostCreated();
    // refreshBalance();
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">TXC System Test</h3>
          <p className="text-sm text-muted-foreground">
            TXC System Temporarily Disabled
          </p>
        </div>
        <Coins className="h-8 w-8 text-amber-500" />
      </div>
      
      <Button 
        onClick={handleTestTXC}
        className="w-full"
        variant="outline"
      >
        Test TXC Earning (Post Created)
      </Button>
      
      {/* TEMPORARILY DISABLED TXC
      {balance && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Available: {balance.available || 0} TXC</p>
          <p>Lifetime: {balance.lifetime_earned || 0} TXC</p>
        </div>
      )}
      */}
    </div>
  );
};