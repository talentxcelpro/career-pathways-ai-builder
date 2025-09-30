
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
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  const queryClient = useQueryClient();
  const { createPostShareData } = useShareContent();

  // Check if post is already saved and liked on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check saved status
        const { data: savedData } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', session.user.id)
          .single();
        
        setIsSaved(!!savedData);

        // Check liked status
        const { data: likedData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', session.user.id)
          .single();
        
        setIsLiked(!!likedData);
      }
      setIsCheckingSaved(false);
    };

    checkStatus();
  }, [postId]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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

  // Save functionality 
  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.info('Please sign in to save posts');
      return;
    }
    
    if (isSaved) {
      // Remove from saved posts
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);
      
      if (error) {
        toast.error('Failed to remove bookmark');
        return;
      }
      
      setIsSaved(false);
    } else {
      // Add to saved posts
      const { error } = await supabase
        .from('saved_posts')
        .insert({ 
          post_id: postId, 
          user_id: session.user.id 
        });
      
      if (error && error.code !== '23505') { // Ignore duplicate error
        toast.error('Failed to save post');
        return;
      }
      
      setIsSaved(true);
      toast.success('Post saved to bookmarks');
    }
  };

  const handleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.info('Please sign in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  // Create share content and post data for enhanced sharing
  const shareContent = postData ? createPostShareData(postData) : {
    id: postId,
    type: 'post' as const,
    title: 'Check out this post',
    description: 'Interesting post from TalentXcel',
    hashtags: ['TalentXcel', 'Networking']
  };

  // Enhanced post data for native sharing
  const enhancedPostData = postData ? {
    content: postData.content,
    mediaUrls: postData.media_urls || [],
    authorName: postData.profiles?.full_name || postData.profiles?.display_name,
    profileUrl: `${window.location.origin}/profile/${postData.author_id}`
  } : undefined;

  return (
    <div className="flex items-center justify-between pt-3 border-t">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${isLiked ? 'text-red-500' : 'text-gray-500'} transition-all hover:scale-105`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-2 text-gray-500 transition-all hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{initialComments}</span>
        </Button>
        
        <ShareButton
          content={shareContent}
          postData={enhancedPostData}
          variant="ghost"
          size="sm"
          showText={false}
          className="transition-all hover:scale-105"
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={isCheckingSaved}
        className={`${isSaved ? 'text-blue-500' : 'text-gray-500'} transition-all hover:scale-105`}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};
