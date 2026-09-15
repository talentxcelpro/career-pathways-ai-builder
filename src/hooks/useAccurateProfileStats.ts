import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAccurateProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['accurate-profile-stats', userId],
    queryFn: async () => {
      if (!userId) return {
        connections: 0,
        profileViews: 0,
        uniqueViewers: 0,
        todayViews: 0,
        weekViews: 0,
        monthViews: 0,
        avgViewDuration: 0
      };

      // Get connections count (both sent and received accepted connections)
      const { count: connectionsCount, error: connectionsError } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      }

      // Get enhanced profile view stats using the new function
      const { data: viewStats, error: viewStatsError } = await supabase
        .rpc('get_profile_view_stats', { p_profile_id: userId });

      if (viewStatsError) {
        console.error('Error fetching profile view stats:', viewStatsError);
        // Fallback to old method if new function fails
        const { count: profileViewsCount, error: fallbackError } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', userId);

        if (fallbackError) {
          console.error('Error fetching fallback profile views:', fallbackError);
        }

        return {
          connections: connectionsCount || 0,
          profileViews: profileViewsCount || 0,
          uniqueViewers: 0,
          todayViews: 0,
          weekViews: 0,
          monthViews: 0,
          avgViewDuration: 0
        };
      }

      return {
        connections: connectionsCount || 0,
        profileViews: viewStats?.total_views || 0,
        uniqueViewers: viewStats?.unique_viewers || 0,
        todayViews: viewStats?.today_views || 0,
        weekViews: viewStats?.week_views || 0,
        monthViews: viewStats?.month_views || 0,
        avgViewDuration: Math.round(viewStats?.avg_view_duration || 0)
      };
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}