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
  stats: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
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
      if (!user) return { posts: [], nextPage: undefined };

      const limit = 20; // Posts per page
      const offset = pageParam * limit;

      // Fetch posts without invalid foreign key joins
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) {
        return { posts: [], nextPage: undefined, hasMore: false };
      }

      // Get post IDs for fetching related data
      const postIds = postsData.map(post => post.id);

      // Fetch likes, comments separately
      const [likesResult, commentsResult] = await Promise.all([
        supabase
          .from('post_likes')
          .select('post_id, user_id')
          .in('post_id', postIds),
        supabase
          .from('post_comments')
          .select('id, post_id, content, created_at, user_id')
          .in('post_id', postIds)
          .order('created_at', { ascending: false })
      ]);

      // Create maps for likes and comments
      const likesMap = new Map<string, any[]>();
      const commentsMap = new Map<string, any[]>();

      likesResult.data?.forEach(like => {
        if (!likesMap.has(like.post_id)) {
          likesMap.set(like.post_id, []);
        }
        likesMap.get(like.post_id)?.push(like);
      });

      commentsResult.data?.forEach(comment => {
        if (!commentsMap.has(comment.post_id)) {
          commentsMap.set(comment.post_id, []);
        }
        commentsMap.get(comment.post_id)?.push(comment);
      });

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, headline, current_company')
        .in('id', authorIds);

      if (profilesError) throw profilesError;

      // Get current user's connections
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('requester_id, recipient_id, status')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connections = new Set();
      connectionsData?.forEach(conn => {
        if (conn.requester_id === user.id) connections.add(conn.recipient_id);
        if (conn.recipient_id === user.id) connections.add(conn.requester_id);
      });

      // Get user's likes
      const { data: userLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      const likedPosts = new Set(userLikes?.map(like => like.post_id) || []);

      // Create profiles map
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Transform posts to LinkedInPost format
      const transformedPosts: LinkedInPost[] = postsData.map(post => {
        const profile = profilesMap.get(post.author_id);
        const isConnection = connections.has(post.author_id);
        const isLiked = likedPosts.has(post.id);
        
        // Get likes and comments for this post
        const postLikes = likesMap.get(post.id) || [];
        const postComments = commentsMap.get(post.id) || [];
        
        // Get top comment
        const topComment = postComments.length > 0 ? postComments[0] : null;

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
          id: post.id,
          user: {
            id: post.author_id,
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
            text: post.content
          },
          caption: post.content,
          stats: {
            likes: postLikes.length,
            comments: postComments.length,
            shares: 0, // Shares not implemented yet
            isLiked,
            isBookmarked: false
          },
          isJobPost: post.content_type === 'job' || post.tags?.includes('job'),
          isPromoted: false, // TODO: Implement promoted posts
          jobDetails: post.content_type === 'job' ? {
            company: profile?.current_company || 'Company',
            position: post.headline || 'Job Position',
            location: 'Location', // TODO: Add location field
            applyUrl: post.featured_image_url // Using featured_image_url as placeholder for apply URL
          } : undefined,
          timestamp: formatTimeAgo(post.created_at),
          engagement: {
            likedBy: [], // TODO: Get liked by users
            topComment: topComment ? {
              user: 'User', // TODO: Get commenter name
              text: topComment.content || 'Comment'
            } : undefined
          }
        };
      });

      return {
        posts: transformedPosts,
        nextPage: postsData.length === limit ? pageParam + 1 : undefined,
        hasMore: postsData.length === limit
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user
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
    if (!user) return;

    // Work with infinite query data structure
    const queryKey = ['linkedInMobilePosts'] as const;
    const previousData = queryClient.getQueryData<{
      pages: Array<{ posts: LinkedInPost[]; nextPage?: number; hasMore: boolean }>;
      pageParams: number[];
    }>(queryKey);

    const toggleInCache = (liked: boolean) => {
      if (!previousData) return;
      
      const updatedPages = previousData.pages.map(page => ({
        ...page,
        posts: page.posts.map(p =>
          p.id === postId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  isLiked: liked,
                  likes: p.stats.likes + (liked ? 1 : -1),
                },
              }
            : p
        )
      }));

      queryClient.setQueryData(queryKey, {
        ...previousData,
        pages: updatedPages
      });
    };

    // Find current like state from flattened posts
    const currentPost = previousData?.pages
      .flatMap(page => page.posts)
      .find(p => p.id === postId);
    const isCurrentlyLiked = currentPost?.stats.isLiked ?? false;
    
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
        queryClient.invalidateQueries({ queryKey });
      }, 400);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      if (previousData) queryClient.setQueryData(queryKey, previousData);
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