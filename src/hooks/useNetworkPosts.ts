import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
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

const POSTS_PER_PAGE = 25;

export const useNetworkPosts = () => {
  const [hasNextPage, setHasNextPage] = useState(true);

  const {
    data,
    fetchNextPage,
    hasNextPage: queryHasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['network-posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * POSTS_PER_PAGE;
      
      // Fetch posts with counts from related tables
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id),
          post_comments!left(id),
          post_shares!left(id)
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

      // Get profiles for all authors in this batch
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, current_company, pro_plan, pro_status, pro_expires_at')
        .in('id', authorIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Combine posts with their profiles and accurate counts
      const postsWithProfiles: NetworkPost[] = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.author_id) || null,
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        shares_count: post.post_shares?.length || 0,
      }));

      // Update hasNextPage based on returned data
      const isLastPage = postsData.length < POSTS_PER_PAGE;
      if (isLastPage) {
        setHasNextPage(false);
      }

      return {
        posts: postsWithProfiles,
        nextPage: isLastPage ? undefined : pageParam + 1,
        isLastPage
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  const loadMore = useCallback(() => {
    if (queryHasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [queryHasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage: queryHasNextPage,
    loadMore,
    error,
    refetch
  };
};