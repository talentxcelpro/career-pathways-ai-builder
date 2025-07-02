
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmojiReactions } from "./EmojiReactions";

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialComments: number;
  initialShares: number;
  onCommentClick: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  initialLikes,
  initialComments,
  initialShares,
  onCommentClick
}) => {
  const queryClient = useQueryClient();

  // Get real-time counts
  const { data: postCounts } = useQuery({
    queryKey: ['postCounts', postId],
    queryFn: async () => {
      const [likesResponse, commentsResponse, sharesResponse] = await Promise.all([
        supabase
          .from('post_likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_shares')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId)
      ]);

      return {
        likes: likesResponse.count || 0,
        comments: commentsResponse.count || 0,
        shares: sharesResponse.count || 0
      };
    },
    initialData: {
      likes: initialLikes,
      comments: initialComments,
      shares: initialShares
    }
  });

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ['postLike', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (userLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', userLike.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLike', postId] });
      queryClient.invalidateQueries({ queryKey: ['postCounts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error('Failed to update like status');
      console.error('Like error:', error);
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postCounts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post shared!');
    },
    onError: (error) => {
      toast.error('Failed to share post');
      console.error('Share error:', error);
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    shareMutation.mutate();
  };

  return (
    <div className="border-t pt-4 space-y-3">
      {/* Emoji Reactions */}
      <EmojiReactions postId={postId} />
      
      {/* Traditional Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${userLike ? 'text-red-600' : 'text-gray-600'} hover:text-red-600`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 mr-2 ${userLike ? 'fill-current' : ''}`} />
            {postCounts?.likes || 0}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-blue-600"
            onClick={onCommentClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {postCounts?.comments || 0}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-green-600"
            onClick={handleShare}
            disabled={shareMutation.isPending}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {postCounts?.shares || 0}
          </Button>
        </div>
      </div>
    </div>
  );
};
