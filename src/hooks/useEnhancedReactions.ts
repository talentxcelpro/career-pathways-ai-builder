import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ReactionType = 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';

export interface PostReactions {
  likes_count: number;
  love_count: number;
  laugh_count: number;
  angry_count: number;
  sad_count: number;
  wow_count: number;
  userReaction?: ReactionType;
}

export const useEnhancedReactions = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get post reactions and user's current reaction
  const { data: reactions, isLoading } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      if (!postId) return null;

      const [postData, userReaction] = await Promise.all([
        supabase
          .from('posts')
          .select('likes_count, love_count, laugh_count, angry_count, sad_count, wow_count')
          .eq('id', postId)
          .single(),
        user ? supabase
          .from('post_reactions')
          .select('reaction_type')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null })
      ]);

      if (postData.error) throw postData.error;

      return {
        likes_count: postData.data?.likes_count || 0,
        love_count: postData.data?.love_count || 0,
        laugh_count: postData.data?.laugh_count || 0,
        angry_count: postData.data?.angry_count || 0,
        sad_count: postData.data?.sad_count || 0,
        wow_count: postData.data?.wow_count || 0,
        userReaction: userReaction.data?.reaction_type as ReactionType | undefined
      };
    },
    enabled: !!postId
  });

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingReaction?.reaction_type === reactionType) {
        // Remove reaction if clicking the same one
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return null;
      } else if (existingReaction) {
        // Update existing reaction
        const { error } = await supabase
          .from('post_reactions')
          .update({ reaction_type: reactionType })
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return reactionType;
      } else {
        // Create new reaction
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
        if (error) throw error;
        return reactionType;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Reaction error:', error);
      toast.error('Failed to update reaction. Please try again.');
    }
  });

  const toggleReaction = useCallback((reactionType: ReactionType) => {
    if (!user) {
      toast.error('Please sign in to react to posts');
      return;
    }
    toggleReactionMutation.mutate(reactionType);
  }, [user, toggleReactionMutation]);

  const getTotalReactions = useCallback(() => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((sum, count) => {
      return typeof count === 'number' ? sum + count : sum;
    }, 0);
  }, [reactions]);

  return {
    reactions: reactions || {
      likes_count: 0,
      love_count: 0,
      laugh_count: 0,
      angry_count: 0,
      sad_count: 0,
      wow_count: 0
    },
    isLoading,
    toggleReaction,
    isUpdating: toggleReactionMutation.isPending,
    getTotalReactions
  };
};