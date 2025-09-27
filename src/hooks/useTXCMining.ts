import { useState, useEffect } from 'react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokenBalance } from './useTokenBalance';
import { 
  OFFICIAL_TXC_MINING_POLICY, 
  TXCReward, 
  verifyPolicyIntegrity 
} from '@/config/txcPolicy';

// ============================================================================
// IMPORTANT: TXC MINING POLICY IS PERMANENT AND IMMUTABLE
// 
// This hook uses the official TXC mining policy from @/config/txcPolicy
// DO NOT modify reward amounts or cooldowns in this file.
// All changes must be made to the official policy configuration.
// ============================================================================

// Export the official policy for backward compatibility
export type { TXCReward } from '@/config/txcPolicy';
export const TXC_MINING_REWARDS = OFFICIAL_TXC_MINING_POLICY;

export const useTXCMining = () => {
  const { user } = useOptimizedAuth();
  const { refreshBalance } = useTokenBalance();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Verify policy integrity on hook initialization
  useEffect(() => {
    if (!verifyPolicyIntegrity()) {
      console.error('🚨 TXC POLICY INTEGRITY VIOLATION IN useTXCMining! 🚨');
    }
  }, []);

  const canEarnReward = async (action: string): Promise<boolean> => {
    if (!user) return false;

    const reward = OFFICIAL_TXC_MINING_POLICY[action];
    if (!reward) return false;

    // Check cooldown
    if (reward.cooldownMinutes) {
      const { data: lastReward } = await supabase
        .from('txc_transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('transaction_type', 'mining')
        .eq('activity_type', action)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastReward) {
        const lastRewardTime = new Date(lastReward.created_at);
        const cooldownEnd = new Date(lastRewardTime.getTime() + reward.cooldownMinutes * 60 * 1000);
        
        if (new Date() < cooldownEnd) {
          return false;
        }
      }
    }

    return true;
  };

  const earnTXC = async (action: string, metadata?: Record<string, any>): Promise<boolean> => {
    if (!user) {
      return false; // Silent fail when not authenticated
    }

    const reward = OFFICIAL_TXC_MINING_POLICY[action];
    if (!reward) {
      return false;
    }

    const canEarn = await canEarnReward(action);
    if (!canEarn) {
      return false; // Silent fail for cooldown
    }

    // Skip edge function calls if already processing to prevent spam
    if (isProcessing) {
      return false;
    }

    setIsProcessing(true);

    try {
      // Call the earn-txc edge function
      const { data, error } = await supabase.functions.invoke('earn-txc', {
        body: {
          action,
          metadata
        }
      });
      
      if (data?.success) {
        // Show success message
        if (action === 'joining_bonus') {
          toast({
            title: "Welcome to TalentXcel! 🎉",
            description: `You've received ${data.amount} TXC as a welcome bonus!`,
            variant: "default"
          });
        } else {
          toast({
            title: "TXC Earned! 🎉",
            description: `+${data.amount} TXC for ${data.description}`,
            variant: "default"
          });
        }
        
        // Refresh balance to show updated amount
        refreshBalance();
        return true;
      } else {
        // Silent fail for cooldown or other non-critical errors
        return false;
      }
      return false;
    } catch (error) {
      console.error('TXC earning error:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const getTXCReward = (action: string): number => {
    return OFFICIAL_TXC_MINING_POLICY[action]?.amount || 0;
  };

  const getAllRewards = (): TXCReward[] => {
    return Object.values(OFFICIAL_TXC_MINING_POLICY);
  };

  const getAvailableActions = async (): Promise<string[]> => {
    if (!user) return [];

    const availableActions: string[] = [];
    
    for (const action of Object.keys(OFFICIAL_TXC_MINING_POLICY)) {
      const canEarn = await canEarnReward(action);
      if (canEarn) {
        availableActions.push(action);
      }
    }

    return availableActions;
  };

  return {
    earnTXC,
    canEarnReward,
    getTXCReward,
    getAllRewards,
    getAvailableActions,
    isProcessing
  };
};