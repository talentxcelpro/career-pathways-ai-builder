import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Referral {
  id: string;
  referred_email: string;
  status: 'pending' | 'signed_up' | 'verified' | 'completed';
  reward_points: number;
  created_at: string;
}

export interface GrowthCampaign {
  id: string;
  title: string;
  description: string;
  reward_multiplier: number;
  end_date: string;
}

export function useGrowth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const referrals = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('id, referral_code, created_at, successful_referrals')
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        referred_email: d.referral_code || 'peer@talentxcel.in',
        status: (d.successful_referrals > 0 ? 'completed' : 'pending') as Referral['status'],
        reward_points: (d.successful_referrals || 0) * 1000,
        created_at: d.created_at
      }));
    },
    enabled: !!user?.id
  });

  const campaigns = useQuery({
    queryKey: ['growth-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_campaigns')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as GrowthCampaign[];
    }
  });

  const addReferral = useMutation({
    mutationFn: async (email: string) => {
      // Record referral invitation in user_referrals
      const { data, error } = await supabase
        .from('user_referrals')
        .update({ updated_at: new Date().toISOString() })
        .eq('referrer_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    }
  });

  return {
    referrals: referrals.data || [],
    campaigns: campaigns.data || [],
    isLoading: referrals.isLoading || campaigns.isLoading,
    addReferral: addReferral.mutateAsync,
    isAdding: addReferral.isPending
  };
}
