import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from './useTokenBalance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getTXCPrice } from '@/types/txc-pricing';

export interface TXCPurchase {
  featureId: string;
  cost: number;
  description: string;
  metadata?: Record<string, any>;
}

export const useTXCPurchase = () => {
  const { user } = useAuth();
  const { availableBalance, refreshBalance } = useTokenBalance();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const canAfford = (cost: number): boolean => {
    return availableBalance >= cost;
  };

  const purchaseWithTXC = async (purchase: TXCPurchase): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a purchase.",
        variant: "destructive"
      });
      return false;
    }

    if (!canAfford(purchase.cost)) {
      toast({
        title: "Insufficient TXC Balance",
        description: `You need ${purchase.cost.toLocaleString()} TXC but only have ${availableBalance.toLocaleString()} TXC available.`,
        variant: "destructive"
      });
      return false;
    }

    setIsProcessing(true);

    try {
      // Call edge function to process TXC purchase
      const { data, error } = await supabase.functions.invoke('process-txc-purchase', {
        body: {
          userId: user.id,
          featureId: purchase.featureId,
          cost: purchase.cost,
          description: purchase.description,
          metadata: purchase.metadata || {}
        }
      });

      if (error) {
        console.error('TXC purchase error:', error);
        toast({
          title: "Purchase Failed",
          description: error.message || "Unable to process your purchase. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "Purchase Successful!",
          description: `You have successfully purchased ${purchase.description} for ${purchase.cost.toLocaleString()} TXC.`,
          variant: "default"
        });
        
        // Refresh balance to show updated amount
        refreshBalance();
        return true;
      } else {
        toast({
          title: "Purchase Failed",
          description: data?.error || "Unable to process your purchase.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('TXC purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const purchaseFeature = async (featureId: string, description?: string, metadata?: Record<string, any>): Promise<boolean> => {
    const cost = getTXCPrice(featureId);
    
    if (cost === 0) {
      toast({
        title: "Invalid Feature",
        description: "This feature is not available for purchase.",
        variant: "destructive"
      });
      return false;
    }

    return purchaseWithTXC({
      featureId,
      cost,
      description: description || `${featureId} feature`,
      metadata
    });
  };

  const getRequiredTXC = (featureId: string): number => {
    return getTXCPrice(featureId);
  };

  const getRemainingTXCNeeded = (featureId: string): number => {
    const required = getTXCPrice(featureId);
    return Math.max(0, required - availableBalance);
  };

  return {
    purchaseWithTXC,
    purchaseFeature,
    canAfford,
    getRequiredTXC,
    getRemainingTXCNeeded,
    isProcessing,
    availableBalance
  };
};