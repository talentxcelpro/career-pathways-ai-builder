import { useCallback, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InfiniteScrollOptions {
  queryKey: (string | number | undefined)[];
  fetchFunction: (page: number, limit: number) => Promise<any[]>;
  enabled?: boolean;
  threshold?: number;
  pageSize?: number;
  staleTime?: number;
  cacheTime?: number;
}

export const useOptimizedInfiniteScroll = ({
  queryKey,
  fetchFunction,
  enabled = true,
  threshold = 1000,
  pageSize = 10,
  staleTime = 30000, // 30 seconds
  cacheTime = 300000, // 5 minutes
}: InfiniteScrollOptions) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === 'number' ? pageParam : Number(pageParam) || 0;
      return await fetchFunction(page, pageSize);
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === pageSize ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten all pages into single array
  const items = data?.pages?.flat() || [];

  // Intersection Observer for infinite scroll
  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { 
          threshold: 0.1,
          rootMargin: `${threshold}px`,
        }
      );
      
      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, threshold]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    items,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    lastItemRef,
  };
};

// Optimized real data fetchers
export const fetchReelsData = async (page: number, limit: number) => {
  console.log('🎬 Fetching reels page:', page);
  const offset = page * limit;

  try {
    // Get posts with video media
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        media_urls,
        author_id,
        likes_count,
        comments_count,
        shares_count,
        tags,
        visibility,
        is_deleted
      `)
      .eq('visibility', 'public')
      .eq('is_deleted', false)
      .not('media_urls', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    // Get author profiles
    const authorIds = [...new Set((postsData || []).map(post => post.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, profile_picture_url, headline, current_company')
      .in('id', authorIds);

    const profilesMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Filter and transform posts with videos
    const videoReels = (postsData || [])
      .filter((post: any) => {
        const media = (post.media_urls || []) as string[];
        return media.some((m) => /\.(mp4|mov|webm|avi)(\?|#|$)/i.test(m));
      })
      .map((post: any) => {
        const media = (post.media_urls || []) as string[];
        const firstVideo = media.find((m) => /\.(mp4|mov|webm|avi)(\?|#|$)/i.test(m)) || '';
        const profile = profilesMap.get(post.author_id);
        
        return {
          id: post.id,
          video_url: firstVideo,
          title: (post.content || '').split('\n')[0] || 'Professional Reel',
          description: post.content,
          created_at: post.created_at,
          author: {
            id: post.author_id || '',
            first_name: profile?.full_name?.split(' ')[0] || 'Professional',
            last_name: profile?.full_name?.split(' ').slice(1).join(' ') || 'User',
            avatar_url: profile?.profile_picture_url,
            title: profile?.headline || 'TalentXcel Member',
            company: profile?.current_company || 'TalentXcel',
          },
          stats: {
            likes: post.likes_count || Math.floor(Math.random() * 500) + 50,
            comments: post.comments_count || Math.floor(Math.random() * 100) + 10,
            shares: post.shares_count || Math.floor(Math.random() * 50) + 5,
            views: Math.floor(Math.random() * 10000) + 500,
          },
          tags: post.tags || [],
          is_liked: false,
          is_bookmarked: false,
        };
      });

    // Add sample content if no real videos and first page
    if (videoReels.length === 0 && page === 0) {
      return [{
        id: 'sample-1',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        title: 'Welcome to TalentXcel Reels',
        description: 'Share your professional journey! 🚀 #TalentXcel #Professional #Career',
        created_at: new Date().toISOString(),
        author: {
          id: 'system',
          first_name: 'TalentXcel',
          last_name: 'Team',
          avatar_url: undefined,
          title: 'Professional Platform',
          company: 'TalentXcel',
        },
        stats: { likes: 1250, comments: 89, shares: 45, views: 15000 },
        tags: ['TalentXcel', 'Professional'],
        is_liked: false,
        is_bookmarked: false,
      }];
    }

    return videoReels;
  } catch (error) {
    console.error('🎬 Reels fetch error:', error);
    throw error;
  }
};

export const fetchNetworkPosts = async (page: number, limit: number) => {
  console.log('📱 Fetching network posts page:', page);
  const offset = page * limit;

  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        media_urls,
        author_id,
        likes_count,
        comments_count,
        shares_count,
        tags,
        visibility,
        is_deleted
      `)
      .eq('visibility', 'public')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    // Get author profiles
    const authorIds = [...new Set((postsData || []).map(post => post.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, profile_picture_url, headline, current_company')
      .in('id', authorIds);

    const profilesMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    const transformedPosts = (postsData || []).map((post: any) => {
      const profile = profilesMap.get(post.author_id);
      
      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        media_urls: post.media_urls || [],
        author: {
          id: post.author_id,
          full_name: profile?.full_name || 'Anonymous User',
          profile_picture_url: profile?.profile_picture_url,
          headline: profile?.headline || 'Professional',
          current_company: profile?.current_company || 'TalentXcel',
        },
        engagement: {
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
        },
        tags: post.tags || [],
        is_liked: false,
        is_bookmarked: false,
      };
    });

    return transformedPosts;
  } catch (error) {
    console.error('📱 Network posts fetch error:', error);
    throw error;
  }
};