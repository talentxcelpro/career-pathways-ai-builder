
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
      const limit = 10;
      const offset = pageParam * limit;
      
      // Primary: try RPC (server-optimized feed)
      try {
        const { data, error } = await supabase.rpc('get_reel_feed', {
          user_id_param: user?.id || null,
          limit_param: limit,
          offset_param: offset
        });

        if (error) throw error;
        console.log('Fetched reels (rpc):', data?.length || 0);
        return (data as ReelData[]) || [];
      } catch (err: any) {
        // Fallback: derive reels from posts with video media
        console.warn('RPC get_reel_feed failed, using posts fallback:', err?.message || err);
        
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('id, user_id, created_at, headline, content, media_urls')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (postsError) {
          console.error('Error fetching posts fallback:', postsError);
          // Gracefully degrade to an empty feed instead of failing the whole query
          return [] as ReelData[];
        }

        const videoPosts = (posts || []).filter((p: any) => Array.isArray(p.media_urls) && p.media_urls.some((u: string) => typeof u === 'string' && u.toLowerCase().endsWith('.mp4')));
        const userIds = Array.from(new Set(videoPosts.map((p: any) => p.user_id).filter(Boolean)));

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const mapped: ReelData[] = videoPosts.map((p: any) => {
          const videoUrl: string = p.media_urls.find((u: string) => u.toLowerCase().endsWith('.mp4'));
          const prof = profileMap.get(p.user_id);
          return {
            id: p.id,
            title: p.headline || '',
            description: p.content || '',
            video_url: videoUrl,
            thumbnail_url: '',
            duration_seconds: 0,
            tags: [],
            user_id: p.user_id,
            created_at: p.created_at,
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            is_following: false,
            has_liked: false,
            user_name: prof?.full_name || 'Creator',
            user_avatar: prof?.profile_picture_url || ''
          } as ReelData;
        });

        console.log('Fetched reels (fallback):', mapped.length);
        return mapped;
      }
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
