import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from './useNewsArticles';

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
  post_type: 'text' | 'image' | 'video' | 'article' | 'job' | 'event' | 'news';
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
  news_article?: NewsArticle;
  is_news_post?: boolean;
}

interface FeedFilters {
  type?: 'all' | 'connections' | 'trending';
  category?: string;
  searchTerm?: string;
}

export function useInfiniteNetworkFeed(filters: FeedFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['network-feed', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20;
      const offset = pageParam * limit;

      let query = supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply search filter if provided - enhanced search across multiple fields
      if (filters.searchTerm && filters.searchTerm.length >= 2) {
        const searchPattern = `%${filters.searchTerm}%`;
        query = query.or(`content.ilike.${searchPattern},headline.ilike.${searchPattern}`);
      }

      // Apply type filters (safe: skip DB-specific columns to avoid errors)
      // if (filters.type === 'trending') {
      //   // Optionally sort by likes_count if available in your schema
      //   // query = query.order('likes_count', { ascending: false });
      // }

      const { data, error } = await query;

      if (error) {
        console.error('useInfiniteNetworkFeed query error:', error);
        throw error;
      }

      // Fetch current user once
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Fetch profiles for all posts using both author_id and user_id
      let profilesMap = new Map<string, any>();
      try {
        // Get all possible user IDs (both author_id and user_id from posts)
        const allUserIds = Array.from(new Set([
          ...(data ?? []).map((p: any) => p.author_id).filter(Boolean),
          ...(data ?? []).map((p: any) => p.user_id).filter(Boolean)
        ]));
        
        if (allUserIds.length > 0) {
          console.log('Fetching profiles for user IDs:', allUserIds);
          const { data: profilesData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, title, location')
            .in('id', allUserIds);
          
          if (profileError) {
            console.error('Profile fetch error:', profileError);
          } else if (profilesData) {
            console.log('Fetched profiles:', profilesData);
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }
      } catch (e) {
        console.error('Profile fetch exception:', e);
      }

      // Transform data to include computed fields
      const transformedData = (data ?? []).map((post: any) => {
        // Try to get profile using author_id first, then user_id as fallback
        const profile = profilesMap.get(post.author_id) || profilesMap.get(post.user_id);
        console.log(`Post ${post.id}: author_id=${post.author_id}, user_id=${post.user_id}, profile=`, profile);
        
        return {
          ...post,
          profiles: profile,
          isLiked: Array.isArray(post.post_likes) && userId ? post.post_likes.some((like: any) => like.user_id === userId) : false,
          isSaved: Array.isArray(post.post_saves) && userId ? post.post_saves.some((save: any) => save.user_id === userId) : false,
        };
      });

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