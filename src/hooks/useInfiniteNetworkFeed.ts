import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from './useNewsArticles';

export interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  user_id?: string;
  media_urls?: string[];
  tags?: string[];
  hashtags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_public: boolean;
  visibility?: string;
  status?: string;
  post_type: 'text' | 'image' | 'video' | 'article' | 'job' | 'event' | 'news';
  headline?: string;
  tagline?: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    headline?: string;
    location?: string;
    current_company?: string;
    username?: string;
    is_verified?: boolean;
  };
  isLiked?: boolean;
  isSaved?: boolean;
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

      // Fetch current user once
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Handle connection-only feed filter
      let connectedAuthorIds: string[] | null = null;
      if (filters.type === 'connections') {
        if (!userId) {
          return { data: [], nextPage: undefined, hasMore: false };
        }

        const { data: conns } = await supabase
          .from('connections')
          .select('requester_id, recipient_id')
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .eq('status', 'accepted');

        connectedAuthorIds = Array.from(new Set([
          userId,
          ...(conns || []).flatMap(c => [c.requester_id, c.recipient_id])
        ].filter(Boolean)));

        if (connectedAuthorIds.length === 0) {
          return { data: [], nextPage: undefined, hasMore: false };
        }
      }

      // Build posts query
      let query = supabase
        .from('posts')
        .select('*');

      // Visibility filter
      if (filters.type === 'connections' && connectedAuthorIds) {
        query = query
          .in('author_id', connectedAuthorIds)
          .eq('status', 'published');
      } else {
        query = query
          .eq('status', 'published')
          .or('is_public.eq.true,visibility.eq.public,visibility.is.null');
      }

      // Apply search filter if provided
      if (filters.searchTerm && filters.searchTerm.trim().length >= 2) {
        const searchPattern = `%${filters.searchTerm.trim()}%`;
        query = query.or(`content.ilike.${searchPattern},headline.ilike.${searchPattern}`);
      }

      // Sorting
      if (filters.type === 'trending') {
        query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('useInfiniteNetworkFeed query error:', error);
        throw error;
      }

      const postList = data ?? [];
      if (postList.length === 0) {
        return { data: [], nextPage: undefined, hasMore: false };
      }

      const postIds = postList.map((p: any) => p.id);

      // Batch fetch engagement in parallel to eliminate N+1 queries in child cards
      const [likesResult, commentsResult, sharesResult, userLikesResult, userSavesResult] = await Promise.all([
        supabase.from('post_likes').select('post_id').in('post_id', postIds),
        supabase.from('post_comments').select('post_id').in('post_id', postIds),
        supabase.from('post_shares').select('post_id').in('post_id', postIds),
        userId ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', userId) : Promise.resolve({ data: [] }),
        userId ? supabase.from('post_saves').select('post_id').in('post_id', postIds).eq('user_id', userId) : Promise.resolve({ data: [] })
      ]);

      // Count engagement per post
      const likesCountMap = new Map<string, number>();
      (likesResult.data || []).forEach((l: any) => {
        likesCountMap.set(l.post_id, (likesCountMap.get(l.post_id) || 0) + 1);
      });

      const commentsCountMap = new Map<string, number>();
      (commentsResult.data || []).forEach((c: any) => {
        commentsCountMap.set(c.post_id, (commentsCountMap.get(c.post_id) || 0) + 1);
      });

      const sharesCountMap = new Map<string, number>();
      (sharesResult.data || []).forEach((s: any) => {
        sharesCountMap.set(s.post_id, (sharesCountMap.get(s.post_id) || 0) + 1);
      });

      const userLikesSet = new Set((userLikesResult.data || []).map((l: any) => l.post_id));
      const userSavesSet = new Set((userSavesResult.data || []).map((s: any) => s.post_id));

      // Fetch profiles for all posts using both author_id and user_id
      let profilesMap = new Map<string, any>();
      const allUserIds = Array.from(new Set([
        ...postList.map((p: any) => p.author_id).filter(Boolean),
        ...postList.map((p: any) => p.user_id).filter(Boolean)
      ]));

      if (allUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, profile_photo_url, title, headline, location, current_company, username, verification_status')
          .in('id', allUserIds);

        if (profilesData) {
          profilesMap = new Map(profilesData.map((p: any) => [p.id, {
            ...p,
            profile_picture_url: p.profile_picture_url || p.profile_photo_url,
            is_verified: p.verification_status === 'verified'
          }]));
        }
      }

      // Transform data with aggregated live engagement
      const transformedData: NetworkPost[] = postList.map((post: any) => {
        const profile = profilesMap.get(post.author_id) || profilesMap.get(post.user_id) || {
          id: post.author_id || post.user_id,
          full_name: 'Professional Member',
          title: 'Member'
        };

        const liveLikes = likesCountMap.get(post.id) ?? (post.likes_count || 0);
        const liveComments = commentsCountMap.get(post.id) ?? (post.comments_count || 0);
        const liveShares = sharesCountMap.get(post.id) ?? (post.shares_count || 0);

        return {
          ...post,
          profiles: profile,
          likes_count: liveLikes,
          comments_count: liveComments,
          shares_count: liveShares,
          isLiked: userLikesSet.has(post.id),
          isSaved: userSavesSet.has(post.id)
        };
      });

      return {
        data: transformedData,
        nextPage: postList.length === limit ? pageParam + 1 : undefined,
        hasMore: postList.length === limit,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}
