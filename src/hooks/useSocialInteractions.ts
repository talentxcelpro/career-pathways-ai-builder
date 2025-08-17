import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSocialInteractions = (postId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get post interactions
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['post-interactions', postId],
    queryFn: async () => {
      if (!user) return { isLiked: false, isBookmarked: false, likesCount: 0, commentsCount: 0, sharesCount: 0 };

      const [postData, likeData, bookmarkData] = await Promise.all([
        supabase
          .from('posts')
          .select('likes_count, comments_count, shares_count')
          .eq('id', postId)
          .single(),
        supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('post_bookmarks')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()
      ]);

      return {
        isLiked: !!likeData.data,
        isBookmarked: !!bookmarkData.data,
        likesCount: postData.data?.likes_count || 0,
        commentsCount: postData.data?.comments_count || 0,
        sharesCount: postData.data?.shares_count || 0
      };
    },
    enabled: !!postId
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return 'unliked';
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        if (error) throw error;
        return 'liked';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['post-interactions', postId] });
      toast({
        title: action === 'liked' ? "Post Liked" : "Post Unliked",
        description: action === 'liked' ? "You liked this post!" : "You unliked this post.",
      });
    },
    onError: (error) => {
      console.error('Like error:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Bookmark/Unbookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingBookmark } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return 'unbookmarked';
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        if (error) throw error;
        return 'bookmarked';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['post-interactions', postId] });
      toast({
        title: action === 'bookmarked' ? "Post Saved" : "Post Unsaved",
        description: action === 'bookmarked' ? "Post saved to your bookmarks!" : "Post removed from bookmarks.",
      });
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Track video view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (duration: number = 0) => {
      const { error } = await supabase
        .from('video_views')
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          view_duration: duration
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('View tracking error:', error);
    }
  });

  return {
    interactions: interactions || { isLiked: false, isBookmarked: false, likesCount: 0, commentsCount: 0, sharesCount: 0 },
    isLoading,
    toggleLike: likeMutation.mutate,
    toggleBookmark: bookmarkMutation.mutate,
    trackView: trackViewMutation.mutate,
    isLiking: likeMutation.isPending,
    isBookmarking: bookmarkMutation.isPending
  };
};