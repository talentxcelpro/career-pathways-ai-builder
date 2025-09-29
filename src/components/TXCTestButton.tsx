import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTokenBalance } from '@/hooks/useTokenBalance';

export const TXCTestButton: React.FC = () => {
  const { triggerPostCreated } = useTXCIntegration();
  const { balance, availableBalance, refreshBalance } = useTokenBalance();

  const handleTestTXC = async () => {
    console.log('Testing TXC system...');
    const success = await triggerPostCreated();
    console.log('TXC test result:', success);
    
    // Force refresh balance
    setTimeout(() => {
      refreshBalance();
    }, 1000);
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">TXC System Test</h3>
          <p className="text-sm text-muted-foreground">
            Current Balance: {availableBalance} TXC
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
      
      {balance && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Available: {balance.available || 0} TXC</p>
          <p>Lifetime: {balance.lifetime_earned || 0} TXC</p>
        </div>
      )}
    </div>
  );
};