import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_public: boolean;
  post_type: 'text' | 'image' | 'video' | 'article' | 'job' | 'event';
  headline?: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    location?: string;
    is_verified?: boolean;
  };
  post_likes?: {
    user_id: string;
  }[];
  post_saves?: {
    user_id: string;
  }[];
}

interface FeedFilters {
  type?: 'all' | 'connections' | 'trending';
  category?: string;
}

export function useInfiniteNetworkFeed(filters: FeedFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['network-feed', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam * limit;

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            profile_picture_url,
            title,
            location,
            is_verified
          ),
          post_likes!left (user_id),
          post_saves!left (user_id)
        `)
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.type === 'trending') {
        query = query.gte('likes_count', 5);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include computed fields
      const transformedData = data?.map(post => ({
        ...post,
        isLiked: post.post_likes?.some((like: any) => like.user_id === (supabase.auth.getUser() as any)?.data?.user?.id) || false,
        isSaved: post.post_saves?.some((save: any) => save.user_id === (supabase.auth.getUser() as any)?.data?.user?.id) || false,
      })) || [];

      return {
        data: transformedData,
        nextPage: data && data.length === limit ? pageParam + 1 : undefined,
        hasMore: data && data.length === limit,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}