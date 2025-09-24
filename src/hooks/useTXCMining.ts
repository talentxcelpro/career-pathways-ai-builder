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
    amount: 150,
    description: 'Create a post',
    cooldownMinutes: 60 // Once per hour
  },
  'connection_made': {
    action: 'connection_made', 
    amount: 75,
    description: 'Connect with someone',
    cooldownMinutes: 30
  },
  'profile_completed': {
    action: 'profile_completed',
    amount: 300,
    description: 'Complete your profile',
    cooldownMinutes: 1440 // Once per day
  },
  'resume_created': {
    action: 'resume_created',
    amount: 225,
    description: 'Create a resume',
    cooldownMinutes: 240 // Once per 4 hours
  },
  'job_applied': {
    action: 'job_applied',
    amount: 90,
    description: 'Apply to a job',
    cooldownMinutes: 60
  },
  'recommendation_given': {
    action: 'recommendation_given',
    amount: 120,
    description: 'Give a recommendation',
    cooldownMinutes: 120
  },
  'skill_added': {
    action: 'skill_added',
    amount: 60,
    description: 'Add skills to profile',
    cooldownMinutes: 180
  },
  'daily_login': {
    action: 'daily_login',
    amount: 75,
    description: 'Daily login bonus',
    cooldownMinutes: 1440 // Once per day
  },
  'course_completed': {
    action: 'course_completed',
    amount: 600,
    description: 'Complete a course',
    cooldownMinutes: 60
  },
  'feedback_given': {
    action: 'feedback_given',
    amount: 45,
    description: 'Provide feedback',
    cooldownMinutes: 60
  },
  'social_activity_bonus': {
    action: 'social_activity_bonus',
    amount: 300,
    description: 'Social activity bonus',
    cooldownMinutes: 10080 // Once per week
  },
  'joining_bonus': {
    action: 'joining_bonus',
    amount: 500,
    description: 'Welcome to TalentXcel!',
    cooldownMinutes: 0 // One-time only
  },
  'referral_made': {
    action: 'referral_made',
    amount: 1000,
    description: 'Refer a friend',
    cooldownMinutes: 0 // No limit on referrals
  },
  'post_liked': {
    action: 'post_liked',
    amount: 20,
    description: 'Like a post',
    cooldownMinutes: 5 // 5 minutes between likes
  },
  'comment_made': {
    action: 'comment_made',
    amount: 20,
    description: 'Comment on a post',
    cooldownMinutes: 10 // 10 minutes between comments
  },
  'article_posted': {
    action: 'article_posted',
    amount: 500,
    description: 'Post an article',
    cooldownMinutes: 240 // Once per 4 hours
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

    const reward = TXC_MINING_REWARDS[action];
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