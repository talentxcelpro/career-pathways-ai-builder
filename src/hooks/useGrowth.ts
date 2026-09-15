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
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Referral[];
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
      const { data, error } = await supabase
        .from('referrals')
        .insert([{ 
          referrer_id: user?.id, 
          referred_email: email,
          status: 'pending'
        }]);
      
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
