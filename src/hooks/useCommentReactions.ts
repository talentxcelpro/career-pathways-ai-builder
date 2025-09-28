import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ReactionType = 'like' | 'love' | 'laugh' | 'angry' | 'sad';

export function useCommentReactions(commentId: string) {
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!commentId) return;
    loadReactions();
  }, [commentId]);

  const loadReactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get all reactions for this comment
      const { data: allReactions, error } = await supabase
        .from('comment_reactions')
        .select('reaction_type, user_id')
        .eq('comment_id', commentId);

      if (error) throw error;

      // Count reactions by type
      const reactionCounts: Record<ReactionType, number> = {
        like: 0,
        love: 0,
        laugh: 0,
        angry: 0,
        sad: 0,
      };

      let currentUserReaction: ReactionType | null = null;

      allReactions?.forEach(reaction => {
        reactionCounts[reaction.reaction_type as ReactionType]++;
        if (user && reaction.user_id === user.id) {
          currentUserReaction = reaction.reaction_type as ReactionType;
        }
      });

      setReactions(reactionCounts);
      setUserReaction(currentUserReaction);
    } catch (error) {
      console.error('Error loading comment reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = async (reactionType: ReactionType) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to react to comments",
          variant: "destructive",
        });
        return;
      }

      // Remove existing reaction if any
      if (userReaction) {
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      }

      // Add new reaction
      const { error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (error) throw error;

      // Update local state
      setReactions(prev => ({
        ...prev,
        [userReaction as ReactionType]: userReaction ? prev[userReaction] - 1 : prev[userReaction as ReactionType],
        [reactionType]: prev[reactionType] + 1,
      }));
      setUserReaction(reactionType);

    } catch (error: any) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeReaction = async () => {
    if (isUpdating || !userReaction) return;

    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setReactions(prev => ({
        ...prev,
        [userReaction]: prev[userReaction] - 1,
      }));
      setUserReaction(null);

    } catch (error: any) {
      console.error('Error removing reaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove reaction",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleReaction = async (reactionType: ReactionType) => {
    if (userReaction === reactionType) {
      await removeReaction();
    } else {
      await addReaction(reactionType);
    }
  };

  return {
    reactions,
    userReaction,
    isLoading,
    isUpdating,
    addReaction,
    removeReaction,
    toggleReaction,
  };
}