import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      if (!userId) return { connections: 0, profileViews: 0 };

      // Get connections count (both sent and received accepted connections)
      const { count: connectionsCount, error: connectionsError } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
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
        connections: connectionsCount || 0,
        profileViews: profileViewsCount || 0,
      };
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}