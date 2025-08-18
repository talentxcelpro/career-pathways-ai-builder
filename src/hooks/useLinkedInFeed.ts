import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

  // Fetch real posts from Supabase with comprehensive data
  const { data: posts = [], isLoading: loading, error } = useQuery({
    queryKey: ['linkedInMobilePosts'],
    queryFn: async () => {
      if (!user) return [];

      // Fetch posts with related data including proper comment structure
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id, user_id),
          post_comments!left(
            id, 
            content, 
            created_at,
            author_id,
            profiles!post_comments_author_id_fkey(
              id,
              full_name,
              profile_picture_url
            )
          ),
          post_shares!left(id)
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

      // Get profiles for all authors with location data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, headline, current_company, location')
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

      // Get liked by users for engagement data
      const { data: likedByData } = await supabase
        .from('post_likes')
        .select(`
          post_id,
          user_id,
          profiles!post_likes_user_id_fkey(
            full_name,
            profile_picture_url
          )
        `)
        .in('post_id', postsData.map(p => p.id));

      const likedByMap = new Map();
      likedByData?.forEach(like => {
        if (!likedByMap.has(like.post_id)) {
          likedByMap.set(like.post_id, []);
        }
        likedByMap.get(like.post_id).push(like.profiles[0]);
      });

      // Create profiles map
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Transform posts to LinkedInPost format with real data
      const transformedPosts: LinkedInPost[] = postsData.map(post => {
        const profile = profilesMap.get(post.author_id);
        const isConnection = connections.has(post.author_id);
        const isLiked = likedPosts.has(post.id);
        
        // Get top comment with real user data
        const topComment = post.post_comments && post.post_comments.length > 0 
          ? {
              user: post.post_comments[0].profiles[0]?.full_name || 'Anonymous User',
              text: post.post_comments[0].content || ''
            }
          : null;

        // Get real liked by users
        const likedByUsers = likedByMap.get(post.id) || [];

        // Determine content type and URL
        let contentType: 'video' | 'image' | 'text' | 'article' = 'text';
        let contentUrl: string | undefined;

        if (post.media_urls && post.media_urls.length > 0) {
          const firstMedia = post.media_urls[0];
          if (firstMedia.includes('.mp4') || firstMedia.includes('.mov') || firstMedia.includes('.avi') || firstMedia.includes('video')) {
            contentType = 'video';
          } else {
            contentType = 'image';
          }
          contentUrl = firstMedia;
        } else if (post.content_type === 'article') {
          contentType = 'article';
        }

        // Use real location data or fallback to profile location
        const userLocation = profile?.location || 'Remote';

        return {
          id: post.id,
          user: {
            id: post.author_id,
            name: profile?.full_name || 'TalentXcel User',
            avatar: profile?.profile_picture_url,
            title: profile?.title || profile?.headline,
            company: profile?.current_company,
            isConnection,
            isFollowing: isConnection
          },
          content: {
            type: contentType,
            url: contentUrl,
            text: post.content,
            title: post.headline
          },
          caption: post.content,
          stats: {
            likes: post.post_likes?.length || 0,
            comments: post.post_comments?.length || 0,
            shares: post.post_shares?.length || 0,
            isLiked,
            isBookmarked: false // Will implement bookmarks separately
          },
          isJobPost: post.content_type === 'job' || post.tags?.includes('job'),
          isPromoted: post.is_featured || false,
          jobDetails: post.content_type === 'job' ? {
            company: profile?.current_company || 'TalentXcel',
            position: post.headline || post.title || 'Professional Opportunity',
            location: userLocation,
            applyUrl: post.external_url || post.featured_image_url
          } : undefined,
          timestamp: formatTimeAgo(post.created_at),
          engagement: {
            likedBy: likedByUsers.map(u => u.full_name).slice(0, 3),
            topComment: topComment
          }
        };
      });

      return transformedPosts;
    },
    enabled: !!user
  });

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

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Refresh the posts
      queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;

    try {
      // Check if already bookmarked
      const { data: existingBookmark } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add bookmark
        await supabase
          .from('user_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Refresh the posts
      queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = (postId: string) => {
    // Open native sharing or copy link
    const shareUrl = `${window.location.origin}/network/posts/${postId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Link copied to clipboard');
      }).catch(console.error);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post or open comment modal
    console.log('Open comments for post:', postId);
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
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleConnect,
    handleApply
  };
};