
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReelData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  tags: string[];
  user_id: string;
  created_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_following: boolean;
  has_liked: boolean;
  user_name: string;
  user_avatar: string;
}

export const useReelsData = () => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['reels-feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching reels with pageParam:', pageParam);
      
      const { data, error } = await supabase.rpc('get_reel_feed', {
        user_id_param: user?.id || null,
        limit_param: 10,
        offset_param: pageParam * 10
      });

      if (error) {
        console.error('Error fetching reels:', error);
        throw error;
      }

      console.log('Fetched reels:', data?.length || 0);
      return data as ReelData[] || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useReelViewTracking = () => {
  const { user } = useAuth();

  const trackView = async (reelId: string, durationWatched: number = 0) => {
    if (!user) return;

    try {
      console.log('Tracking view for reel:', reelId);
      await supabase.rpc('increment_reel_view', {
        reel_id_param: reelId,
        user_id_param: user.id,
        duration_watched_param: durationWatched
      });
    } catch (error) {
      console.error('Error tracking reel view:', error);
    }
  };

  return { trackView };
};
