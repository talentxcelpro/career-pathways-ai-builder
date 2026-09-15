import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      if (!userId) return { TalentNetwork: 0, profileViews: 0 };

      // Get TalentNetwork count (both sent and received accepted TalentNetwork)
      const { count: TalentNetworkCount, error: TalentNetworkError } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (TalentNetworkError) {
        console.error('Error fetching TalentNetwork:', TalentNetworkError);
      }

      // Get profile views count 
      const { count: profileViewsCount, error: viewsError } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', userId);

      if (viewsError) {
        console.error('Error fetching profile views:', viewsError);
      }

      return {
        TalentNetwork: TalentNetworkCount || 0,
        profileViews: profileViewsCount || 0,
      };
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

