
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShareButton } from '@/components/shared/ShareButton';
import { useShareContent } from '@/hooks/useShareContent';

interface PostActionsProps {
  postId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  onCommentClick?: () => void;
  postData?: any; // For creating share content
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  onCommentClick,
  postData
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();
  const { createPostShareData } = useShareContent();

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error('Failed to update like');
      console.error('Like error:', error);
    }
  });

  // Save mutation - now working with saved_posts table
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Post removed from saved' : 'Post saved');
    },
    onError: (error) => {
      toast.error('Failed to save post');
      console.error('Save error:', error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  // Create share content if postData is available
  const shareContent = postData ? createPostShareData(postData) : {
    id: postId,
    type: 'post' as const,
    title: 'Check out this post',
    description: 'Interesting post from TalentXcel',
    hashtags: ['TalentXcel', 'Networking']
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-2 text-gray-500"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{initialComments}</span>
        </Button>
        
        <ShareButton
          content={shareContent}
          variant="ghost"
          size="sm"
          showText={false}
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className={`${isSaved ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};
