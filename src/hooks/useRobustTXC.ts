import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TXCTransferParams {
  toUserId: string;
  amount: number;
  description?: string;
}

export const useRobustTXC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const transferTXC = async ({ toUserId, amount, description = 'TXC Transfer' }: TXCTransferParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to transfer TXC",
        variant: "destructive"
      });
      return { success: false, error: 'Not authenticated' };
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Transfer amount must be greater than 0",
        variant: "destructive"
      });
      return { success: false, error: 'Invalid amount' };
    }

    setIsProcessing(true);
    
    try {
      // Use the secure atomic transfer function
      const { data, error } = await supabase.rpc('transfer_txc_secure', {
        p_from_user_id: user.id,
        p_to_user_id: toUserId,
        p_amount: amount,
        p_description: description
      });

      if (error) {
        console.error('Transfer error:', error);
        toast({
          title: "Transfer Failed",
          description: error.message || "An error occurred during transfer",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      if (!data.success) {
        toast({
          title: "Transfer Failed",
          description: data.error || "Transfer was not successful",
          variant: "destructive"
        });
        return { success: false, error: data.error };
      }

      toast({
        title: "Transfer Successful",
        description: `Successfully transferred ${amount} TXC`,
        variant: "default"
      });

      return { success: true, data };
      
    } catch (error) {
      console.error('Unexpected transfer error:', error);
      toast({
        title: "Transfer Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsProcessing(false);
    }
  };

  const checkRateLimit = async (actionType: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('check_txc_rate_limit', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_limit: 10,
        p_window_minutes: 60
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return false;
      }

      if (!data) {
        toast({
          title: "Rate Limit Exceeded",
          description: "You've exceeded the rate limit for this action. Please try again later.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  };

  const earnTXCSecure = async (amount: number, activityType: string, description: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    // Check rate limits for earning actions
    const canProceed = await checkRateLimit(`earn_${activityType}`);
    if (!canProceed) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    setIsProcessing(true);

    try {
      // Use edge function for secure TXC earning with validation
      const { data, error } = await supabase.functions.invoke('earn-txc', {
        body: {
          userId: user.id,
          amount,
          activityType,
          description,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Earn TXC error:', error);
        toast({
          title: "Earning Failed",
          description: "Failed to earn TXC. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast({
          title: "TXC Earned!",
          description: `You earned ${amount} TXC for ${description}`,
          variant: "default"
        });
        return { success: true, data };
      } else {
        toast({
          title: "Earning Failed",
          description: data?.error || "Failed to earn TXC",
          variant: "destructive"
        });
        return { success: false, error: data?.error };
      }

    } catch (error) {
      console.error('Unexpected earning error:', error);
      toast({
        title: "Earning Error",
        description: "An unexpected error occurred while earning TXC",
        variant: "destructive"
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsProcessing(false);
    }
  };

  const purchaseWithTXC = async (featureType: string, cost: number, description: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    // Check rate limits for purchases
    const canProceed = await checkRateLimit('purchase');
    if (!canProceed) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('txc-unified-purchase', {
        body: {
          purchaseType: 'feature',
          featureId: featureType,
          cost,
          description
        }
      });

      if (error) {
        console.error('Purchase error:', error);
        toast({
          title: "Purchase Failed",
          description: "Failed to complete TXC purchase. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast({
          title: "Purchase Successful",
          description: `Successfully purchased ${featureType} for ${cost} TXC`,
          variant: "default"
        });
        return { success: true, data };
      } else {
        toast({
          title: "Purchase Failed",
          description: data?.error || "Insufficient TXC balance",
          variant: "destructive"
        });
        return { success: false, error: data?.error };
      }

    } catch (error) {
      console.error('Unexpected purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred during purchase",
        variant: "destructive"
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    transferTXC,
    earnTXCSecure,
    purchaseWithTXC,
    checkRateLimit,
    isProcessing
  };
};