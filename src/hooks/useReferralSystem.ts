import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  txc_reward: number;
  created_at: string;
  completed_at: string | null;
  metadata: any;
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

      // Check if user already has a referral code
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (existingReferral) {
        setMyReferralCode(existingReferral.referral_code);
        return existingReferral.referral_code;
      }

      // Generate new referral code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: code,
          status: 'pending'
        })
        .select('referral_code')
        .single();

      if (error) throw error;

      setMyReferralCode(data.referral_code);
      return data.referral_code;
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

      // Update referral with referee
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referee_id: user.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      // Award TXC to referrer
      await supabase.functions.invoke('process-txc-mining', {
        body: {
          userId: referral.referrer_id,
          action: 'referral_completed',
          amount: referral.txc_reward,
          description: `Referral bonus for inviting a new user`,
          metadata: { referee_id: user.id }
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

  // Share referral
  const shareReferral = async (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'copy') => {
    if (!myReferralCode) {
      await generateReferralCode();
      return;
    }

    const referralUrl = `${window.location.origin}/signup?ref=${myReferralCode}`;
    const shareText = `Join TalentXcel and earn TXC tokens! Use my referral code: ${myReferralCode} 🚀`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${shareText} ${referralUrl}`);
        toast({
          title: "Copied!",
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
      progress: (completedReferrals % 5) * 20
    };
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
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalEarnings: referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.txc_reward, 0)
    },
    referralEvents: referrals,
    referralRewards: referrals.filter(r => r.status === 'completed'),
    loading: isLoading,
    generateReferralLink,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress
  };
};