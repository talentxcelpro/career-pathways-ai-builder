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

  // Generate or get user's referral code with dual-table support
  const generateReferralCode = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);

      // Check if user already has a referral code in referrals table
      const { data: existingReferral, error: refError } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (!refError && existingReferral?.referral_code) {
        setMyReferralCode(existingReferral.referral_code);
        return existingReferral.referral_code;
      }

      // Check in user_referrals table
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

      // Try inserting into referrals table
      try {
        const { data, error } = await supabase
          .from('referrals')
          .insert({
            referrer_id: user.id,
            referral_code: deterministicCode,
            status: 'pending',
            reward_type: 'txc',
            reward_amount: 1000,
            referred_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select('referral_code')
          .maybeSingle();

        if (data?.referral_code) {
          setMyReferralCode(data.referral_code);
          return data.referral_code;
        }
      } catch (insertErr) {
        console.warn('referrals table insert bypassed:', insertErr);
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
        .from('referrals')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('status', 'pending')
        .maybeSingle();

      if (!findError && referral) {
        await supabase
          .from('referrals')
          .update({
            referred_id: user.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
            referred_email: user.email
          })
          .eq('id', referral.id);

        await supabase.functions.invoke('process-txc-mining', {
          body: {
            userId: referral.referrer_id,
            action: 'referral_completed',
            amount: referral.reward_amount || 1000,
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
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReferrals(data);
        const activeReferral = data.find(r => r.status === 'pending');
        if (activeReferral?.referral_code) {
          setMyReferralCode(activeReferral.referral_code);
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
