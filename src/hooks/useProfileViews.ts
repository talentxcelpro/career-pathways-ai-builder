import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseProfileViewsReturn {
  viewCount: number;
  incrementView: (profileId: string, viewType?: string) => Promise<void>;
  trackProfileView: (profileUserId: string) => Promise<void>;
  isLoading: boolean;
}

export const useProfileViews = (profileId?: string): UseProfileViewsReturn => {
  const [viewCount, setViewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch current view count
  useEffect(() => {
    if (!profileId) return;

    const fetchViewCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);

        if (!error && count !== null) {
          setViewCount(count);
        }
      } catch (error) {
        console.warn('Failed to fetch view count:', error);
      }
    };

    fetchViewCount();
  }, [profileId]);

  // Increment view count with debouncing
  const incrementView = useCallback(async (targetProfileId: string, viewType: string = 'profile') => {
    if (isLoading || !targetProfileId) return;
    
    // Don't track self-views
    if (user?.id === targetProfileId) return;

    setIsLoading(true);

    try {
      // Check if user has viewed this profile recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentView } = await supabase
        .from('profile_views')
        .select('id')
        .eq('profile_id', targetProfileId)
        .eq('viewer_id', user?.id || null)
        .gte('viewed_at', oneHourAgo)
        .limit(1)
        .single();

      // Only increment if no recent view found
      if (!recentView) {
        const { error } = await supabase
          .from('profile_views')
          .insert({
            profile_id: targetProfileId,
            viewer_id: user?.id || null,
            view_type: viewType as any,
            viewed_at: new Date().toISOString()
          });

        if (!error) {
          setViewCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.warn('Failed to increment view:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoading]);

  // Legacy compatibility function
  const trackProfileView = useCallback(async (profileUserId: string) => {
    await incrementView(profileUserId, 'profile');
  }, [incrementView]);

  return {
    viewCount,
    incrementView,
    trackProfileView,
    isLoading
  };
};