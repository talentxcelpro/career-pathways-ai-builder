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

  // Increment view count with debouncing and server-side validation
  const incrementView = useCallback(async (targetProfileId: string, viewType: string = 'profile') => {
    if (isLoading || !targetProfileId) return;
    
    // Don't track self-views
    if (user?.id === targetProfileId) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('record_profile_visit', {
        p_profile_id: targetProfileId,
        p_view_source: viewType,
        p_session_id: null
      });

      if (!error && data) {
        setViewCount(prev => prev + 1);
      }
    } catch (error) {
      console.warn('Failed to record profile visit:', error);
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