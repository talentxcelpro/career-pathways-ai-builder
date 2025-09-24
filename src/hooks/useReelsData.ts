
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
          .select(`
            id, 
            user_id, 
            created_at, 
            headline, 
            content, 
            media_urls,
            likes_count,
            comments_count,
            shares_count,
            views_count
          `)
          .not('media_urls', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (postsError) {
          console.error('Error fetching posts fallback:', postsError);
          return [] as ReelData[];
        }

        console.log('Raw posts fetched:', posts?.length || 0);
        console.log('Sample post media_urls:', posts?.[0]?.media_urls);

        // Enhanced video detection with flexible URL patterns
        const videoPosts = (posts || []).filter((p: any) => {
          console.log('Processing post:', p.id, 'media_urls:', p.media_urls);
          
          if (!Array.isArray(p.media_urls)) {
            console.log('Post has non-array media_urls:', p.id, p.media_urls);
            return false;
          }
          
          if (p.media_urls.length === 0) {
            console.log('Post has empty media_urls array:', p.id);
            return false;
          }
          
          const hasVideo = p.media_urls.some((u: string) => {
            if (!u || typeof u !== 'string') return false;
            
            const url = u.toLowerCase();
            console.log('Checking URL:', url);
            
            // Check for video file extensions anywhere in the URL
            const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
            const hasVideoExtension = videoExtensions.some(ext => url.includes(ext));
            
            // Check for video-related keywords in URL path
            const hasVideoKeywords = url.includes('video') || url.includes('media');
            
            // Special handling for Supabase storage patterns
            const isSupabaseVideo = url.includes('supabase') && hasVideoExtension;
            
            const isVideo = hasVideoExtension || (hasVideoKeywords && url.includes('post-media'));
            
            if (isVideo) {
              console.log('✓ Found video URL:', u);
            }
            
            return isVideo;
          });
          
          if (hasVideo) {
            console.log('✓ Video post found:', p.id, p.media_urls);
          } else {
            console.log('✗ No video found in post:', p.id, p.media_urls);
          }
          
          return hasVideo;
        });

        console.log('Video posts after filtering:', videoPosts.length);
        const userIds = Array.from(new Set(videoPosts.map((p: any) => p.user_id).filter(Boolean)));

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const mapped: ReelData[] = videoPosts.map((p: any) => {
          // Find the first video URL
          const videoUrl: string = p.media_urls.find((u: string) => 
            u.toLowerCase().includes('.mp4') || u.toLowerCase().includes('.mov') || u.toLowerCase().includes('.webm')
          );
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
            views_count: p.views_count || 0,
            likes_count: p.likes_count || 0,
            comments_count: p.comments_count || 0,
            shares_count: p.shares_count || 0,
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
