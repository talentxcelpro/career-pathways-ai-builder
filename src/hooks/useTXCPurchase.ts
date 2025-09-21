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

      // Enhanced routing logic for subscriptions
      const isSubscription = options.featureId === 'pro_subscription' || 
                           options.metadata?.packageType || 
                           ['Pro Starter', 'Pro Business', 'Pro Elite'].some(plan => 
                             options.featureId.includes(plan) || options.description.includes(plan)
                           );

      const endpoint = isSubscription ? 'process-txc-purchase' : 'txc-feature-purchase';
      
      console.log(`TXC Purchase: ${endpoint}`, {
        featureId: options.featureId,
        cost: options.cost,
        isSubscription,
        metadata: options.metadata
      });

      // Prepare request body based on endpoint
      const requestBody = isSubscription ? {
        userId: user.id,
        featureId: 'pro_subscription',
        cost: options.cost,
        description: options.description,
        planName: options.metadata?.packageType || options.description,
        metadata: options.metadata || {}
      } : {
        featureId: options.featureId,
        customCost: options.cost,
        customDescription: options.description,
        metadata: options.metadata || {}
      };

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: requestBody
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (data?.success) {
        toast.success(`Purchase successful! ${options.cost} TXC spent.`);
        refreshBalance();
        return true;
      } else {
        console.error('Purchase failed:', data);
        throw new Error(data?.error || 'Purchase failed - no success response');
      }
    } catch (error) {
      console.error('TXC purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed. Please try again.';
      toast.error(errorMessage);
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