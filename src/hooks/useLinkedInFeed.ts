import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

interface LinkedInPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    company?: string;
    isFollowing?: boolean;
    isConnection?: boolean;
  };
  content: {
    type: 'video' | 'image' | 'text' | 'article';
    url?: string;
    text?: string;
    title?: string;
    duration?: number;
  };
  caption?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  // Database fields
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
  isJobPost?: boolean;
  isPromoted?: boolean;
  jobDetails?: {
    company: string;
    position: string;
    location: string;
    applyUrl?: string;
  };
  timestamp: string;
  engagement?: {
    likedBy: string[];
    topComment?: {
      user: string;
      text: string;
    };
  };
}

export const useLinkedInFeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use infinite query for proper pagination
  const {
    data,
    isLoading: loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['linkedInMobilePosts'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const limit = 20; // Posts per page
        const offset = pageParam * limit;

        console.log('Fetching posts with pagination:', { pageParam, limit, offset, hasUser: !!user });

        // Fetch posts with related data - works for both authenticated and non-authenticated users
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            post_likes!left(id, user_id),
            post_comments!left(id, content, created_at),
            post_shares!left(id)
          `)
          .eq('visibility', 'public')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (postsError) {
          console.error('Posts query error:', postsError);
          throw postsError;
        }

        if (!postsData || postsData.length === 0) {
          console.log('No posts found, returning empty array');
          return { posts: [], nextPage: undefined, hasMore: false };
        }

        console.log(`Found ${postsData.length} posts`);

        // Get unique author IDs, filtering out null/undefined values
        const authorIds = [...new Set(postsData
          .map(post => post.author_id || post.user_id)
          .filter(Boolean)
        )];

        console.log(`Fetching profiles for ${authorIds.length} authors:`, authorIds);

        // Get profiles for all authors
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, title, headline, current_company')
          .in('id', authorIds);

        if (profilesError) {
          console.error('Profiles query error:', profilesError);
          // Don't throw here, continue with empty profiles
        }

        console.log(`Found ${profilesData?.length || 0} profiles`);

        let connections = new Set();
        let likedPosts = new Set();

        // Only fetch user-specific data if authenticated
        if (user) {
          // Get current user's connections
          const { data: connectionsData } = await supabase
            .from('connections')
            .select('requester_id, recipient_id, status')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .eq('status', 'accepted');

          connectionsData?.forEach(conn => {
            if (conn.requester_id === user.id) connections.add(conn.recipient_id);
            if (conn.recipient_id === user.id) connections.add(conn.requester_id);
          });

          // Get user's likes
          const { data: userLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id);

          likedPosts = new Set(userLikes?.map(like => like.post_id) || []);
        }

        // Create profiles map
        const profilesMap = new Map((profilesData || []).map(profile => [profile.id, profile]));

        // Transform posts to LinkedInPost format with proper error handling
        const transformedPosts: LinkedInPost[] = postsData.map(post => {
          try {
            const authorId = post.author_id || post.user_id;
            const profile = profilesMap.get(authorId);
            const isConnection = connections.has(authorId);
            const isLiked = user ? likedPosts.has(post.id) : false;

            // Ensure we have valid user data
            if (!authorId) {
              console.warn('Post missing author_id and user_id:', post.id);
            }
        
        // Get top comment
        const topComment = post.post_comments && post.post_comments.length > 0 
          ? post.post_comments[0] 
          : null;

        // Determine content type and URL
        let contentType: 'video' | 'image' | 'text' | 'article' = 'text';
        let contentUrl: string | undefined;

        if (post.media_urls && post.media_urls.length > 0) {
          const firstMedia = post.media_urls[0];
          if (firstMedia.includes('.mp4') || firstMedia.includes('.mov') || firstMedia.includes('.avi')) {
            contentType = 'video';
          } else {
            contentType = 'image';
          }
          contentUrl = firstMedia;
        } else if (post.content_type === 'article') {
          contentType = 'article';
        }

            return {
              id: post.id || `post-${Date.now()}`,
              user: {
                id: authorId || 'unknown',
                name: profile?.full_name || 'Professional User',
                avatar: profile?.profile_picture_url,
                title: profile?.title,
                company: profile?.current_company,
                isConnection,
                isFollowing: isConnection
              },
              content: {
                type: contentType,
                url: contentUrl,
                text: post.content || ''
              },
              caption: post.content || '',
              stats: {
                likes: Array.isArray(post.post_likes) ? post.post_likes.length : (post.likes_count || 0),
                comments: Array.isArray(post.post_comments) ? post.post_comments.length : (post.comments_count || 0),
                shares: Array.isArray(post.post_shares) ? post.post_shares.length : (post.shares_count || 0),
                isLiked,
                isBookmarked: false
              },
              // Add fallback database fields
              likes_count: Array.isArray(post.post_likes) ? post.post_likes.length : (post.likes_count || 0),
              comments_count: Array.isArray(post.post_comments) ? post.post_comments.length : (post.comments_count || 0),
              shares_count: Array.isArray(post.post_shares) ? post.post_shares.length : (post.shares_count || 0),
              views_count: post.views_count || 0,
              isJobPost: post.content_type === 'job' || (Array.isArray(post.tags) && post.tags.includes('job')),
              isPromoted: false,
              jobDetails: post.content_type === 'job' ? {
                company: profile?.current_company || 'Company',
                position: post.headline || 'Job Position',
                location: 'Location',
                applyUrl: post.featured_image_url
              } : undefined,
              timestamp: formatTimeAgo(post.created_at || new Date().toISOString()),
              engagement: {
                likedBy: [],
                topComment: topComment ? {
                  user: 'User',
                  text: topComment.content || 'Comment'
                } : undefined
              }
            };
          } catch (postError) {
            console.error('Error transforming post:', post.id, postError);
            // Return a safe fallback post
            return {
              id: post.id || `error-post-${Date.now()}`,
              user: {
                id: 'unknown',
                name: 'Professional User',
                avatar: undefined,
                title: undefined,
                company: undefined,
                isConnection: false,
                isFollowing: false
              },
              content: {
                type: 'text' as const,
                url: undefined,
                text: post.content || 'Content unavailable'
              },
              caption: post.content || 'Content unavailable',
              stats: {
                likes: 0,
                comments: 0,
                shares: 0,
                isLiked: false,
                isBookmarked: false
              },
              likes_count: 0,
              comments_count: 0,
              shares_count: 0,
              views_count: 0,
              isJobPost: false,
              isPromoted: false,
              timestamp: formatTimeAgo(post.created_at || new Date().toISOString()),
              engagement: {
                likedBy: [],
                topComment: undefined
              }
            };
          }
        });

        console.log(`Successfully transformed ${transformedPosts.length} posts`);

        return {
          posts: transformedPosts,
          nextPage: postsData.length === limit ? pageParam + 1 : undefined,
          hasMore: postsData.length === limit
        };
      } catch (error) {
        console.error('LinkedInFeed query error:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: true, // Always enabled, will work for both authenticated and non-authenticated users
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      console.log('User not authenticated, cannot like post');
      return;
    }

    // Optimistic update to avoid flicker
    const key = ['linkedInMobilePosts'] as const;
    const previousData = queryClient.getQueryData(key) as { pages: { posts: LinkedInPost[] }[] } | undefined;

    const toggleInCache = (liked: boolean) => {
      if (!previousData?.pages) return;
      
      const updatedData = {
        ...previousData,
        pages: previousData.pages.map(page => ({
          ...page,
          posts: page.posts.map((p: LinkedInPost) =>
            p.id === postId
              ? {
                  ...p,
                  stats: {
                    ...p.stats,
                    isLiked: liked,
                    likes: (p.stats?.likes || 0) + (liked ? 1 : -1),
                  },
                }
              : p
          )
        }))
      };
      queryClient.setQueryData(key, updatedData);
    };

    // Find current like state from cache
    let isCurrentlyLiked = false;
    if (previousData?.pages) {
      for (const page of previousData.pages) {
        const post = page.posts.find((p: LinkedInPost) => p.id === postId);
        if (post) {
          isCurrentlyLiked = post.stats?.isLiked ?? false;
          break;
        }
      }
    }
    // Apply optimistic toggle
    toggleInCache(!isCurrentlyLiked);

    try {
      // Check if already liked in DB (source of truth)
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase.rpc('publish_engagement_event', {
          p_event_type: 'unlike',
          p_content_type: 'post',
          p_content_id: postId,
          p_user_id: user.id,
          p_content_owner_id: null,
          p_module: 'network',
        });
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase.rpc('publish_engagement_event', {
          p_event_type: 'like',
          p_content_type: 'post',
          p_content_id: postId,
          p_user_id: user.id,
          p_content_owner_id: null,
          p_module: 'network',
        });
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Optionally refresh in background without resetting list
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: key });
      }, 400);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      if (previousData) queryClient.setQueryData(key, previousData);
    }
  };

  const handleBookmark = (postId: string) => {
    // TODO: Implement bookmarking
    console.log('Bookmark post:', postId);
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/network/posts/${postId}`;
    const title = 'Check out this post on TalentXcel';
    const text = 'Sharing a post I found interesting on TalentXcel';

    if (navigator.share) {
      navigator
        .share({ title, text, url })
        .catch(() => {
          // Fallback to opening a new window if user cancels or share fails
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        });
    } else {
      // Fallback share options (LinkedIn as default)
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to the post detail page where full comments UI is implemented
    window.location.href = `/network/posts/${postId}#comments`;
  };

  const handleConnect = async (userId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      // Refresh the posts to update connection status
      queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleApply = (jobUrl: string) => {
    if (jobUrl) {
      window.open(jobUrl, '_blank');
    }
  };

  return {
    posts,
    loading,
    error: error?.message || null,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleConnect,
    handleApply
  };
};