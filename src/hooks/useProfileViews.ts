import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileViews = () => {
  const { user } = useAuth();

  const trackProfileView = async (profileUserId: string) => {
    // Don't track if viewing own profile or not authenticated
    if (!user || user.id === profileUserId) return;

    try {
      // Check if we've viewed this profile recently (within 6 hours)
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      
      const { data: recentView } = await supabase
        .from('profile_views')
        .select('id')
        .eq('profile_id', profileUserId)
        .eq('viewer_id', user.id)
        .gte('viewed_at', sixHoursAgo)
        .limit(1);

      // If we've viewed recently, don't track again
      if (recentView && recentView.length > 0) return;

      // Track the profile view
      await supabase.rpc('increment_profile_views', {
        profile_user_id: profileUserId,
        viewer_ip: null,
        viewer_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  return { trackProfileView };
};