import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { websocketManager } from '@/utils/websocketManager';

export interface NetworkPost {
  id: string;
  content: string;
  headline?: string;
  language?: string;
  translated_content?: any;
  ai_topics?: string[];
  ai_sentiment?: string;
  media_urls?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  profiles?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

interface UseInfiniteNetworkFeedProps {
  feedType: 'all' | 'smart' | 'trending';
  pageSize?: number;
}

const FEED_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 30 * 1000; // 30 seconds

export const useInfiniteNetworkFeed = ({ 
  feedType, 
  pageSize = 10 
}: UseInfiniteNetworkFeedProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const latestPostRef = useRef<string | null>(null);

  // Fetch feed data with pagination
  const fetchFeedPage = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const offset = pageParam * pageSize;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          full_name,
          profile_picture_url,
          title,
          current_company,
          pro_plan,
          pro_status,
          pro_expires_at
        )
      `)
      .eq('status', 'published')
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    // Apply feed type filters
    if (feedType === 'smart' && user) {
      // Smart feed: get user's connections first, then filter posts
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connections && connections.length > 0) {
        const connectedUserIds = connections.map(conn => 
          conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
        );
        
        // Include user's own posts and posts from connections
        const allRelevantIds = [user.id, ...connectedUserIds];
        query = query.in('author_id', allRelevantIds);
      } else {
        // No connections, just show user's own posts
        query = query.eq('author_id', user.id);
      }
    } else if (feedType === 'trending') {
      // Trending feed: high engagement posts
      query = query.gte('likes_count', 5).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Store latest post ID for real-time detection
    if (data && data.length > 0 && pageParam === 0) {
      latestPostRef.current = data[0].id;
    }

    return {
      posts: data || [],
      nextPage: data && data.length === pageSize ? pageParam + 1 : undefined,
      hasMore: data && data.length === pageSize
    };
  };

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['networkFeed', feedType, user?.id],
    queryFn: fetchFeedPage,
    getNextPageParam: (lastPage: any) => lastPage?.nextPage,
    gcTime: FEED_CACHE_TIME,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialPageParam: 0,
  });

  // Flatten paginated data
  const posts = data?.pages.flatMap((page: any) => page.posts) || [];

  // Real-time subscription for new posts
  useEffect(() => {
    if (!user) return;

    const channelName = `network-feed-${feedType}`;
    const channel = websocketManager.createChannel(channelName);

    // Listen for new posts
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'status=eq.published'
    }, (payload) => {
      const newPost = payload.new as NetworkPost;
      
      // Check if this post should appear in current feed
      const shouldInclude = feedType === 'all' || 
        (feedType === 'smart' && user?.id) || // TODO: Add connection check
        (feedType === 'trending' && newPost.likes_count >= 5);

      if (shouldInclude && latestPostRef.current !== newPost.id) {
        setNewPostsAvailable(prev => prev + 1);
      }
    });

    // Listen for post updates (likes, comments, etc.)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'posts'
    }, (payload) => {
      const updatedPost = payload.new as NetworkPost;
      
      // Update the specific post in cache
      queryClient.setQueryData(['networkFeed', feedType, user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: NetworkPost) => 
              post.id === updatedPost.id ? { ...post, ...updatedPost } : post
            )
          }))
        };
      });
    });

    channel.subscribe((status) => {
      setRealtimeConnected(status === 'SUBSCRIBED');
      console.log(`🔥 Feed channel ${channelName} status:`, status);
    });

    return () => {
      websocketManager.removeChannel(channelName);
    };
  }, [user, feedType, queryClient]);

  // Auto-refresh functionality
  const refreshFeed = useCallback(async () => {
    setNewPostsAvailable(0);
    await refetch();
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [refetch]);

  // Infinite scroll handler
  const { ref: loadMoreRef } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    fetchNextPage: () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    }
  });

  // Background refresh every 30 seconds for lightweight updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Only background refresh if user is active and tab is visible
      if (!document.hidden) {
        queryClient.invalidateQueries({
          queryKey: ['networkFeed', feedType, user.id]
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, feedType, queryClient]);

  return {
    posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreRef,
    newPostsAvailable,
    realtimeConnected,
    refreshFeed,
    refetch
  };
};

// Simple infinite scroll hook
const useInfiniteScroll = ({ hasNextPage, fetchNextPage }: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetching) {
          setIsFetching(true);
          fetchNextPage();
          setTimeout(() => setIsFetching(false), 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetching]);

  return { ref, isFetching };
};