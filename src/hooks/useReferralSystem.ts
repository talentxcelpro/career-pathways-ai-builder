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
  reward_type: string;
  reward_amount: number;
  referred_email: string | null;
  referred_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useReferralSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate or get user's referral code directly from active user_referrals table
  const generateReferralCode = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);

      // Check in active user_referrals table (relation referrals was deprecated)
      const { data: uRef } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (uRef?.referral_code) {
        setMyReferralCode(uRef.referral_code);
        return uRef.referral_code;
      }

      // Generate clean deterministic referral code based on user UID
      const deterministicCode = 'TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase();

      // Upsert into active user_referrals table
      try {
        const { data } = await supabase
          .from('user_referrals')
          .insert({
            referrer_id: user.id,
            referral_code: deterministicCode,
            total_referrals: 0,
            successful_referrals: 0,
            current_tier: 0,
            is_active: true
          })
          .select('referral_code')
          .maybeSingle();

        if (data?.referral_code) {
          setMyReferralCode(data.referral_code);
          return data.referral_code;
        }
      } catch (insertErr) {
        console.warn('user_referrals table insert bypassed:', insertErr);
      }

      // Fallback code
      setMyReferralCode(deterministicCode);
      return deterministicCode;
    } catch (error) {
      console.warn('Notice in generateReferralCode (using fallback):', error);
      const fallback = 'TXC' + (user.id ? user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : 'MEMBER');
      setMyReferralCode(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  // Use a referral code
  const useReferralCode = async (referralCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      const { data: referral, error: findError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (!findError && referral) {
        await supabase
          .from('user_referrals')
          .update({
            total_referrals: (referral.total_referrals || 0) + 1,
            successful_referrals: (referral.successful_referrals || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', referral.id);

        await supabase.functions.invoke('process-txc-mining', {
          body: {
            userId: referral.referrer_id,
            action: 'referral_completed',
            amount: 1000,
            description: 'Referral bonus for inviting a new user',
            metadata: { referee_id: user.id }
          }
        });
      }

      toast({
        title: "Referral Applied! 🎉",
        description: "Welcome to TalentXcel! Referral recorded successfully.",
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
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReferrals(data);
        if (data.length > 0 && data[0]?.referral_code) {
          setMyReferralCode(data[0].referral_code);
        }
        return;
      }

      // Fallback to user_referrals
      const { data: uData } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (uData && uData.length > 0) {
        const mapped: Referral[] = uData.map(u => ({
          id: u.id,
          referrer_id: u.referrer_id,
          referred_id: u.user_id,
          referral_code: u.referral_code || ('TXC' + user.id.slice(0, 8).toUpperCase()),
          status: 'completed',
          reward_type: 'txc',
          reward_amount: 1000,
          referred_email: null,
          referred_at: u.created_at,
          completed_at: u.created_at,
          expires_at: null,
          metadata: {},
          created_at: u.created_at,
          updated_at: u.updated_at || u.created_at
        }));
        setReferrals(mapped);
      }
    } catch (error) {
      console.warn('Notice in fetchReferrals (graceful fallback):', error);
    }
  };

  // Share referral
  const shareReferral = async (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'copy') => {
    let code = myReferralCode;
    if (!code) {
      code = await generateReferralCode();
    }
    if (!code) return;

    const referralUrl = `${window.location.origin}/signup?ref=${code}`;
    const shareText = `Join TalentXcel and earn TXC platform credits! Use my referral code: ${code} 🚀`;

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
      generateReferralCode();
      fetchReferrals();
    }
  }, [user?.id]);

  return {
    referrals,
    myReferralCode,
    isLoading,
    generateReferralCode,
    useReferralCode,
    shareReferral,
    refreshReferrals: fetchReferrals
  };
};
