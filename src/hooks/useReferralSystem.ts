import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  txc_reward: number;
  created_at: string;
  completed_at: string | null;
  metadata: any;
  share_count?: number;
  click_count?: number;
  conversion_rate?: number;
}

export const useReferralSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate or get user's referral code  
  const generateReferralCode = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);

      // Try to get from user_referrals table first
      const { data: userStats } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userStats?.referral_code) {
        setMyReferralCode(userStats.referral_code);
        return userStats.referral_code;
      }

      // Check if user already has a referral code in old table
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (existingReferral) {
        setMyReferralCode(existingReferral.referral_code);
        return existingReferral.referral_code;
      }

      // Initialize user referral stats (this will generate a code)
      const { data, error } = await supabase.rpc('initialize_user_referral_stats', {
        p_user_id: user.id
      });

      if (error) throw error;

      // Get the generated code
      const { data: newStats } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      if (newStats?.referral_code) {
        setMyReferralCode(newStats.referral_code);
        return newStats.referral_code;
      }

      return null;
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Use a referral code (when someone signs up with your code)
  const useReferralCode = async (referralCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      // Find the referral
      const { data: referral, error: findError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError) throw findError;
      if (!referral) {
        toast({
          title: "Invalid Code",
          description: "Referral code not found or already used",
          variant: "destructive"
        });
        return false;
      }

      // Update referral with referee (using correct column name)
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referred_id: user.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      // Award TXC to referrer via gamification system
      await supabase.functions.invoke('award-txc-tokens', {
        body: {
          user_id: referral.referrer_id,
          amount: referral.txc_reward,
          description: `Referral bonus for inviting a new user`,
          source: 'referral',
          metadata: { referred_id: user.id, referral_code: referralCode }
        }
      });

      toast({
        title: "Referral Applied! 🎉",
        description: `Welcome! Your referrer will receive ${referral.txc_reward} TXC.`,
      });

      return true;
    } catch (error) {
      console.error('Error using referral code:', error);
      toast({
        title: "Error",
        description: "Failed to apply referral code",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's referrals
  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Set referral code if exists
      const activeReferral = data?.find(r => r.status === 'pending');
      if (activeReferral) {
        setMyReferralCode(activeReferral.referral_code);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  // Share referral with tracking
  const shareReferral = async (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'copy') => {
    if (!myReferralCode) {
      await generateReferralCode();
      return;
    }

    const referralUrl = `${window.location.origin}/refer/${myReferralCode}`;
    const shareText = `🚀 Join TalentXcel and boost your career with AI! Use my referral code: ${myReferralCode} and earn 1,000 TXC tokens!`;

    // Track sharing event
    await supabase.rpc('track_referral_event', {
      p_referral_code: myReferralCode,
      p_event_type: 'link_shared',
      p_event_data: { platform, url: referralUrl }
    });

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}&hashtags=TalentXcel,CareerGrowth,AI`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${shareText} ${referralUrl}`);
        toast({
          title: "Copied! 📋",
          description: "Referral link copied to clipboard",
        });
        break;
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferrals();
    }
  }, [user]);

  const generateReferralLink = async () => {
    const code = await generateReferralCode();
    return code ? `${window.location.origin}/signup?ref=${code}` : '';
  };

  const copyReferralLink = async () => {
    const link = await generateReferralLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const shareOnPlatform = (platform: 'whatsapp' | 'twitter' | 'linkedin') => {
    shareReferral(platform);
  };

  const getTierProgress = () => {
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    return {
      current: completedReferrals,
      nextTier: Math.ceil((completedReferrals + 1) / 5) * 5,
      progress: (completedReferrals % 5) * 20,
      next: Math.ceil((completedReferrals + 1) / 5) * 5,
      remaining: Math.ceil((completedReferrals + 1) / 5) * 5 - completedReferrals
    };
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed').length;

  const getReferralLink = () => {
    return myReferralCode ? `${window.location.origin}/signup?ref=${myReferralCode}` : '';
  };

  return {
    referrals,
    myReferralCode,
    isLoading,
    generateReferralCode,
    useReferralCode,
    fetchReferrals,
    shareReferral,
    referralData: {
      totalReferrals: referrals.length,
      completedReferrals,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalEarnings: referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.txc_reward, 0),
      total_referrals: referrals.length,
      successful_referrals: completedReferrals,
      current_tier: Math.floor(completedReferrals / 5) + 1,
      referral_code: myReferralCode || ''
    },
    referralEvents: referrals.map(r => ({
      ...r,
      referee_name: `User ${r.referee_id?.slice(0, 8) || 'Unknown'}`,
      referee_email: `user@example.com`,
      status: r.status === 'completed' ? 'registered' as const : r.status,
      reward_description: `${r.txc_reward} TXC earned`
    })),
    referralRewards: referrals.filter(r => r.status === 'completed').map(r => ({
      ...r,
      status: 'granted' as const,
      reward_description: `${r.txc_reward} TXC earned`
    })),
    loading: isLoading,
    generateReferralLink,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress,
    getReferralLink
  };
};