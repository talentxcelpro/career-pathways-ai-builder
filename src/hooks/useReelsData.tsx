import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReelData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  has_liked?: boolean;
  is_following?: boolean;
}

export const useReelsData = () => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['reels'],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam * limit;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          created_at,
          tags,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          post_metrics (
            likes_count,
            comments_count,
            shares_count,
            views_count
          )
        `)
        .eq('post_type', 'video')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data.map((post): ReelData => ({
        id: post.id,
        title: '',
        description: post.content || '',
        video_url: post.media_urls?.[0] || '',
        thumbnail_url: undefined,
        user_id: post.profiles?.display_name || 'Unknown',
        user_name: post.profiles?.display_name || 'Unknown',
        user_avatar: post.profiles?.avatar_url,
        created_at: post.created_at,
        tags: post.tags || [],
        likes_count: post.post_metrics?.likes_count || 0,
        comments_count: post.post_metrics?.comments_count || 0,
        shares_count: post.post_metrics?.shares_count || 0,
        views_count: post.post_metrics?.views_count || 0,
        has_liked: false,
        is_following: false
      }));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export const useReelViewTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackViewMutation = useMutation({
    mutationFn: async ({ reelId, watchTime }: { reelId: string; watchTime?: number }) => {
      if (!user) return;

      const { error } = await supabase
        .from('post_views')
        .insert({
          post_id: reelId,
          user_id: user.id,
          watch_time: watchTime || 1
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    }
  });

  const trackView = (reelId: string, watchTime?: number) => {
    trackViewMutation.mutate({ reelId, watchTime });
  };

  return { trackView };
};