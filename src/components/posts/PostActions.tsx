import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Repeat2, Bookmark, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShareButton } from '@/components/shared/ShareButton';
import { useShareContent } from '@/hooks/useShareContent';
import { useReshare } from '@/hooks/useReshare';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PostActionsProps {
  postId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  initialReshares?: number;
  onCommentClick?: () => void;
  postData?: any; // For creating share content
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  initialReshares = 0,
  onCommentClick,
  postData
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReshareModal, setShowReshareModal] = useState(false);
  const [reshareComment, setReshareComment] = useState('');
  const queryClient = useQueryClient();
  const { createPostShareData } = useShareContent();
  const { user } = useAuth();
  const { resharePost, isResharing } = useReshare();

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

  // Save functionality - temporarily disabled until saved_posts table is created
  const handleSave = () => {
    toast.info('Save functionality coming soon!');
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleReshare = async () => {
    if (!user) {
      toast.error('Please log in to reshare posts');
      return;
    }

    try {
      await resharePost(postId, reshareComment.trim() || undefined);
      toast.success('Post reshared successfully!');
      setReshareComment('');
      setShowReshareModal(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Reshare error:', error);
      toast.error('Failed to reshare post');
    }
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
    <>
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
            onClick={onCommentClick ? onCommentClick : () => (window.location.href = `/network/posts/${postId}`)}
            className="gap-2 text-gray-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{initialComments}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReshareModal(true)}
            className="gap-2 text-gray-500 hover:text-green-600"
          >
            <Repeat2 className="h-4 w-4" />
            <span>Reshare</span>
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

      {/* Reshare Modal */}
      <Dialog open={showReshareModal} onOpenChange={setShowReshareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat2 className="h-5 w-5" />
              Reshare Post
            </DialogTitle>
          </DialogHeader>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Resharing to your network
                </p>
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="mb-4">
            <Textarea
              placeholder="Add a comment to your reshare (optional)..."
              value={reshareComment}
              onChange={(e) => setReshareComment(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reshareComment.length}/500 characters
            </p>
          </div>

          {/* Original Post Preview */}
          {postData && (
            <div className="border border-border rounded-lg p-3 mb-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={postData.profiles?.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {postData.profiles?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {postData.profiles?.full_name || 'User'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {postData.headline || postData.content}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReshareModal(false)}
              className="flex-1"
              disabled={isResharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReshare}
              className="flex-1"
              disabled={isResharing}
            >
              {isResharing ? (
                <>
                  <Repeat2 className="h-4 w-4 mr-2 animate-spin" />
                  Resharing...
                </>
              ) : (
                <>
                  <Repeat2 className="h-4 w-4 mr-2" />
                  Reshare
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};