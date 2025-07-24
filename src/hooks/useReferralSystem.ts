import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReferralData {
  id: string;
  referral_code: string;
  referral_slug: string;
  total_referrals: number;
  successful_referrals: number;
  current_tier: number;
  rewards_earned: any;
  total_rewards_value: number;
  is_active: boolean;
}

export interface ReferralEvent {
  id: string;
  referee_email?: string;
  referee_name?: string;
  status: string;
  conversion_date?: string;
  source_platform?: string;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  reward_type: string;
  reward_description: string;
  reward_data: any;
  status: string;
  granted_at?: string;
  redeemed_at?: string;
  expires_at?: string;
  created_at: string;
}

export const useReferralSystem = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralEvents, setReferralEvents] = useState<ReferralEvent[]>([]);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Get or create user referral record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Call function to get or create referral record
      const { data: referralId, error: createError } = await supabase
        .rpc('get_or_create_user_referral', { user_uuid: user.id });

      if (createError) {
        console.error('Error creating referral record:', createError);
        setError(createError.message);
        return;
      }

      // Fetch referral data
      const { data: referral, error: referralError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .single();

      if (referralError) {
        console.error('Error fetching referral data:', referralError);
        setError(referralError.message);
        return;
      }

      setReferralData(referral);

      // Fetch referral events
      const { data: events, error: eventsError } = await supabase
        .from('referral_events')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching referral events:', eventsError);
      } else {
        setReferralEvents(events || []);
      }

      // Fetch referral rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (rewardsError) {
        console.error('Error fetching referral rewards:', rewardsError);
      } else {
        setReferralRewards(rewards || []);
      }

    } catch (err) {
      console.error('Error in fetchReferralData:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = (platform?: string) => {
    if (!referralData) return '';
    
    const baseUrl = 'https://talentxcel.in';
    const personalizedPath = `/refer/${referralData.referral_slug}`;
    const queryParams = new URLSearchParams({
      ref: referralData.referral_code,
      ...(platform && { utm_source: platform })
    });
    
    return `${baseUrl}${personalizedPath}?${queryParams.toString()}`;
  };

  const copyReferralLink = async (platform?: string) => {
    const link = generateReferralLink(platform);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const getShareMessage = (platform: string) => {
    const link = generateReferralLink(platform);
    const messages = {
      whatsapp: `🚀 Join me on TalentXcel AI and unlock powerful career tools for free! Use my referral link: ${link}`,
      linkedin: `I'm using TalentXcel AI for my career growth and you should too! Join using my referral link and get started: ${link}`,
      twitter: `Accelerate your career with TalentXcel AI! 🚀 Join using my referral link: ${link}`,
      telegram: `🎯 TalentXcel AI has amazing career tools! Join using my referral link: ${link}`,
    };
    return messages[platform as keyof typeof messages] || messages.whatsapp;
  };

  const shareOnPlatform = (platform: string) => {
    const message = getShareMessage(platform);
    const link = generateReferralLink(platform);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
    };
    
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const getTierProgress = () => {
    if (!referralData) return { current: 0, next: 5, progress: 0 };
    
    const tiers = [5, 25, 100, 300, 400];
    const current = referralData.successful_referrals;
    
    let nextTier = tiers.find(tier => tier > current) || 400;
    let currentTierIndex = tiers.findIndex(tier => tier > current);
    let currentTierMin = currentTierIndex > 0 ? tiers[currentTierIndex - 1] : 0;
    
    const progress = currentTierMin === 0 
      ? (current / nextTier) * 100 
      : ((current - currentTierMin) / (nextTier - currentTierMin)) * 100;
    
    return {
      current,
      next: nextTier,
      progress: Math.min(progress, 100),
      remaining: Math.max(0, nextTier - current)
    };
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  return {
    referralData,
    referralEvents,
    referralRewards,
    loading,
    error,
    generateReferralLink,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress,
    refresh: fetchReferralData
  };
};