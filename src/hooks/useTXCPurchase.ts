import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTokenBalance } from './useTokenBalance';
import { toast } from 'sonner';

interface PurchaseOptions {
  featureId: string;
  cost: number;
  description: string;
  metadata?: Record<string, any>;
}

// Legacy function signature for backward compatibility
interface LegacyPurchaseFunction {
  (featureId: string, description: string, metadata?: Record<string, any>): Promise<boolean>;
}

export const useTXCPurchase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { availableBalance, refreshBalance } = useTokenBalance();

  const canAfford = (cost: number) => {
    return availableBalance >= cost;
  };

  const purchaseWithTXC = async (options: PurchaseOptions): Promise<boolean> => {
    if (!canAfford(options.cost)) {
      toast.error(`Insufficient TXC balance. You need ${options.cost} TXC but only have ${availableBalance} TXC.`);
      return false;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to continue');
        return false;
      }

      // Use the feature purchase endpoint for individual features, or process-txc-purchase for subscriptions
      const endpoint = options.featureId === 'pro_subscription' ? 'process-txc-purchase' : 'txc-feature-purchase';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          userId: user.id,
          featureId: options.featureId,
          cost: options.cost,
          description: options.description,
          metadata: options.metadata || {}
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Purchase successful! ${options.cost} TXC spent.`);
        refreshBalance();
        return true;
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('TXC purchase error:', error);
      toast.error(error.message || 'Purchase failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy wrapper function for backward compatibility
  const purchaseFeature: LegacyPurchaseFunction = async (featureId: string, description: string, metadata?: Record<string, any>) => {
    return purchaseWithTXC({
      featureId,
      cost: 0, // Cost will be determined by the backend based on featureId
      description,
      metadata
    });
  };

  return {
    canAfford,
    purchaseWithTXC,
    purchaseFeature,
    isLoading,
    isProcessing: isLoading, // Alias for backward compatibility
    availableBalance
  };
};