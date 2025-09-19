import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokenBalance } from './useTokenBalance';

export interface TXCReward {
  action: string;
  amount: number;
  description: string;
  cooldownMinutes?: number;
}

export const TXC_MINING_REWARDS: Record<string, TXCReward> = {
  'post_created': {
    action: 'post_created',
    amount: 50,
    description: 'Create a post',
    cooldownMinutes: 60 // Once per hour
  },
  'connection_made': {
    action: 'connection_made', 
    amount: 25,
    description: 'Connect with someone',
    cooldownMinutes: 30
  },
  'profile_completed': {
    action: 'profile_completed',
    amount: 100,
    description: 'Complete your profile',
    cooldownMinutes: 1440 // Once per day
  },
  'resume_created': {
    action: 'resume_created',
    amount: 75,
    description: 'Create a resume',
    cooldownMinutes: 240 // Once per 4 hours
  },
  'job_applied': {
    action: 'job_applied',
    amount: 30,
    description: 'Apply to a job',
    cooldownMinutes: 60
  },
  'recommendation_given': {
    action: 'recommendation_given',
    amount: 40,
    description: 'Give a recommendation',
    cooldownMinutes: 120
  },
  'skill_added': {
    action: 'skill_added',
    amount: 20,
    description: 'Add skills to profile',
    cooldownMinutes: 180
  },
  'daily_login': {
    action: 'daily_login',
    amount: 25,
    description: 'Daily login bonus',
    cooldownMinutes: 1440 // Once per day
  },
  'course_completed': {
    action: 'course_completed',
    amount: 200,
    description: 'Complete a course',
    cooldownMinutes: 60
  },
  'feedback_given': {
    action: 'feedback_given',
    amount: 15,
    description: 'Provide feedback',
    cooldownMinutes: 60
  },
  'social_activity_bonus': {
    action: 'social_activity_bonus',
    amount: 100,
    description: 'Social activity bonus',
    cooldownMinutes: 10080 // Once per week
  }
};

export const useTXCMining = () => {
  const { user } = useAuth();
  const { refreshBalance } = useTokenBalance();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const canEarnReward = async (action: string): Promise<boolean> => {
    if (!user) return false;

    const reward = TXC_MINING_REWARDS[action];
    if (!reward) return false;

    // Check cooldown
    if (reward.cooldownMinutes) {
      const { data: lastReward } = await supabase
        .from('token_transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('transaction_type', 'mining')
        .eq('source', action)
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
      toast({
        title: "Authentication Required",
        description: "Please sign in to earn TXC.",
        variant: "destructive"
      });
      return false;
    }

    const reward = TXC_MINING_REWARDS[action];
    if (!reward) {
      console.warn(`Unknown TXC mining action: ${action}`);
      return false;
    }

    const canEarn = await canEarnReward(action);
    if (!canEarn) {
      return false; // Silent fail for cooldown
    }

    setIsProcessing(true);

    try {
      // Call edge function to process TXC mining
      const { data, error } = await supabase.functions.invoke('process-txc-mining', {
        body: {
          userId: user.id,
          action: action,
          amount: reward.amount,
          description: reward.description,
          metadata: metadata || {}
        }
      });

      if (error) {
        console.error('TXC mining error:', error);
        return false;
      }

      if (data?.success) {
        toast({
          title: "TXC Earned! 🎉",
          description: `+${reward.amount} TXC for ${reward.description}`,
          variant: "default"
        });
        
        // Refresh balance to show updated amount
        refreshBalance();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('TXC mining error:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const getTXCReward = (action: string): number => {
    return TXC_MINING_REWARDS[action]?.amount || 0;
  };

  const getAllRewards = (): TXCReward[] => {
    return Object.values(TXC_MINING_REWARDS);
  };

  const getAvailableActions = async (): Promise<string[]> => {
    if (!user) return [];

    const availableActions: string[] = [];
    
    for (const action of Object.keys(TXC_MINING_REWARDS)) {
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