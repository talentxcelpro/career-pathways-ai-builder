import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface EmojiReaction {
  reaction_type: string;
  emoji_code: string;
  count: number;
}

interface EmojiReactionsProps {
  postId: string;
}

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({ postId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  // Get available emoji configs
  const { data: emojiConfigs } = useQuery({
    queryKey: ['emojiConfigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emoji_configs')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Get reaction counts for this post
  const { data: reactionCounts } = useQuery({
    queryKey: ['postReactions', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_post_reaction_counts', { post_uuid: postId });
      
      if (error) throw error;
      return data as EmojiReaction[];
    }
  });

  // Get user's reactions for this post
  const { data: userReactions } = useQuery({
    queryKey: ['userReactions', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(r => r.reaction_type);
    }
  });

  // Add/remove reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ reactionType, action }: { reactionType: string; action: 'add' | 'remove' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (action === 'add') {
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postReactions', postId] });
      queryClient.invalidateQueries({ queryKey: ['userReactions', postId] });
      setShowPicker(false);
    },
    onError: (error) => {
      toast.error('Failed to update reaction');
      console.error('Reaction error:', error);
    }
  });

  const handleReaction = (reactionType: string) => {
    const hasReaction = userReactions?.includes(reactionType);
    reactionMutation.mutate({
      reactionType,
      action: hasReaction ? 'remove' : 'add'
    });
  };

  const getReactionCount = (reactionType: string) => {
    return reactionCounts?.find(r => r.reaction_type === reactionType)?.count || 0;
  };

  const hasUserReacted = (reactionType: string) => {
    return userReactions?.includes(reactionType) || false;
  };

  if (!emojiConfigs || emojiConfigs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Show reactions with counts */}
      {reactionCounts?.map((reaction) => (
        <Button
          key={reaction.reaction_type}
          variant="ghost"
          size="sm"
          className={`h-8 px-2 rounded-full text-xs ${
            hasUserReacted(reaction.reaction_type)
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => handleReaction(reaction.reaction_type)}
          disabled={reactionMutation.isPending}
        >
          <span className="mr-1">{reaction.emoji_code}</span>
          {reaction.count}
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-6 gap-1">
            {emojiConfigs.map((emoji) => (
              <Button
                key={emoji.emoji_name}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 text-lg hover:bg-gray-100 ${
                  hasUserReacted(emoji.emoji_name) ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleReaction(emoji.emoji_name)}
                disabled={reactionMutation.isPending}
                title={emoji.emoji_name}
              >
                {emoji.emoji_code}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};