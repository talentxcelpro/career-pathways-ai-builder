import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReelComment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
  reel_id: string;
}

export const useReelComments = (reelId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          created_at,
          reel_id,
          profiles!comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('content_id', reelId)
        .eq('content_type', 'reel')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      return data.map(comment => ({
        id: comment.id,
        content: comment.content,
        user_id: comment.user_id,
        user_name: (comment.profiles as any)?.display_name || 'Unknown User',
        user_avatar: (comment.profiles as any)?.avatar_url || '',
        created_at: comment.created_at,
        reel_id: comment.reel_id
      })) as ReelComment[];
    },
    enabled: !!reelId,
    refetchOnWindowFocus: false,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          user_id: user.id,
          content_id: reelId,
          content_type: 'reel'
        })
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles!comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Transform the response
      return {
        id: data.id,
        content: data.content,
        user_id: data.user_id,
        user_name: (data.profiles as any)?.display_name || user.user_metadata?.full_name || 'You',
        user_avatar: (data.profiles as any)?.avatar_url || user.user_metadata?.avatar_url || '',
        created_at: data.created_at,
        reel_id: reelId
      } as ReelComment;
    },
    onSuccess: (newComment) => {
      // Add the new comment to the cache
      queryClient.setQueryData(['reel-comments', reelId], (oldComments: ReelComment[] = []) => [
        ...oldComments,
        newComment
      ]);

      // Update the comments count in the reels feed
      queryClient.setQueryData(['reels-feed', user?.id], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((reel: any) =>
              reel.id === reelId
                ? { ...reel, comments_count: reel.comments_count + 1 }
                : reel
            )
          )
        };
      });

      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  });

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!reelId) return;

    const subscription = supabase
      .channel(`reel-comments-${reelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `content_id=eq.${reelId}`
      }, async (payload) => {
        // Fetch the full comment data with profile info
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            user_id,
            created_at,
            profiles!comments_user_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          const newComment: ReelComment = {
            id: data.id,
            content: data.content,
            user_id: data.user_id,
            user_name: (data.profiles as any)?.display_name || 'Unknown User',
            user_avatar: (data.profiles as any)?.avatar_url || '',
            created_at: data.created_at,
            reel_id: reelId
          };

          // Only add if it's not from the current user (to avoid duplicates)
          if (data.user_id !== user?.id) {
            queryClient.setQueryData(['reel-comments', reelId], (oldComments: ReelComment[] = []) => {
              // Check if comment already exists
              if (oldComments.some(c => c.id === newComment.id)) {
                return oldComments;
              }
              return [...oldComments, newComment];
            });
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [reelId, user?.id, queryClient]);

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending
  };
};