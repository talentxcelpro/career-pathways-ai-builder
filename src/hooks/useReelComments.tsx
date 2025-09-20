import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReelComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  post_id: string;
}

export const useReelComments = (reelId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: async (): Promise<ReelComment[]> => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', reelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((comment): ReelComment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user_name: comment.profiles?.display_name || 'Unknown User',
        user_avatar: comment.profiles?.avatar_url,
        post_id: reelId
      }));
    },
    enabled: !!reelId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: reelId,
          user_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reel-comments', reelId] });
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    }
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending
  };
};