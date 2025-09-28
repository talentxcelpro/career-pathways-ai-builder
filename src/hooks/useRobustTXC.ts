import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TXCSecurityValidator, logTXCSecurityEvent } from '@/utils/txcSecurity';
import { useTXCPerformanceOptimizer } from './useTXCPerformanceOptimizer';

interface TXCTransferParams {
  toUserId: string;
  amount: number;
  description?: string;
}

export const useRobustTXC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { optimizedBalanceQuery, optimizedTransactionQuery, measureOperation, batchOperations } = useTXCPerformanceOptimizer();

  const transferTXC = async ({ toUserId, amount, description = 'TXC Transfer' }: TXCTransferParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to transfer TXC",
        variant: "destructive"
      });
      return { success: false, error: 'Not authenticated' };
    }

    // Enhanced validation using security validator
    const validation = TXCSecurityValidator.validateTransaction({
      fromUserId: user.id,
      toUserId,
      amount,
      description
    });

    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      logTXCSecurityEvent({
        userId: user.id,
        action: 'transfer_validation_failed',
        details: { errors: validation.errors, toUserId, amount },
        severity: 'medium'
      });
      
      toast({
        title: "Invalid Transfer Data",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }

    // Client-side rate limiting
    if (!TXCSecurityValidator.checkClientRateLimit(user.id, 'transfer')) {
      logTXCSecurityEvent({
        userId: user.id,
        action: 'transfer_rate_limited',
        details: { toUserId, amount },
        severity: 'high'
      });
      
      toast({
        title: "Too Many Requests",
        description: "Please wait before making another transfer",
        variant: "destructive"
      });
      return { success: false, error: 'Rate limit exceeded' };
    }

    setIsProcessing(true);
    
    try {
      // Use optimized operation with the secure atomic transfer function
      const sanitizedData = validation.sanitizedValue!;
      const result = await measureOperation(
        async () => {
          const { data, error } = await supabase.rpc('transfer_txc_secure', {
            p_from_user_id: sanitizedData.fromUserId,
            p_to_user_id: sanitizedData.toUserId,
            p_amount: sanitizedData.amount,
            p_description: sanitizedData.description
          });
          return { data, error };
        },
        `transfer_${sanitizedData.fromUserId}_${sanitizedData.toUserId}_${sanitizedData.amount}`
      );
      
      const { data, error } = result;

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

    // Enhanced validation
    const validation = TXCSecurityValidator.validateTransaction({
      amount,
      description,
      activityType
    });

    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      logTXCSecurityEvent({
        userId: user.id,
        action: 'earn_validation_failed',
        details: { errors: validation.errors, amount, activityType },
        severity: 'medium'
      });
      return { success: false, error: errorMessage };
    }

    // Client-side rate limiting
    if (!TXCSecurityValidator.checkClientRateLimit(user.id, `earn_${activityType}`)) {
      logTXCSecurityEvent({
        userId: user.id,
        action: 'earn_rate_limited',
        details: { amount, activityType },
        severity: 'high'
      });
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Check rate limits for earning actions
    const canProceed = await checkRateLimit(`earn_${activityType}`);
    if (!canProceed) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    setIsProcessing(true);

    try {
      // Use optimized operation with edge function for secure TXC earning
      const sanitizedData = validation.sanitizedValue!;
      const result = await measureOperation(
        async () => {
          const { data, error } = await supabase.functions.invoke('earn-txc-secure', {
            body: {
              userId: user.id,
              amount: sanitizedData.amount,
              activityType: sanitizedData.activityType,
              description: sanitizedData.description,
              timestamp: new Date().toISOString()
            }
          });
          return { data, error };
        },
        `earn_${user.id}_${sanitizedData.activityType}_${sanitizedData.amount}`
      );
      
      const { data, error } = result;

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

  // Optimized data fetching methods
  const getOptimizedBalance = async () => {
    if (!user?.id) return 0;
    return optimizedBalanceQuery(user.id);
  };

  const getOptimizedTransactions = async (limit: number = 10) => {
    if (!user?.id) return [];
    return optimizedTransactionQuery(user.id, limit);
  };

  const batchTXCOperations = async (operations: (() => Promise<any>)[]) => {
    return batchOperations(operations);
  };

  return {
    transferTXC,
    earnTXCSecure,
    purchaseWithTXC,
    checkRateLimit,
    getOptimizedBalance,
    getOptimizedTransactions,
    batchTXCOperations,
    isProcessing
  };
};