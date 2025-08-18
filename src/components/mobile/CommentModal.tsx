import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Heart, Reply } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
  };
  likes_count: number;
  is_liked: boolean;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          author_id,
          post_id,
          likes_count,
          profiles!post_comments_author_id_fkey(
            id,
            full_name,
            profile_picture_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked each comment
      if (user?.id && data) {
        const commentIds = data.map(c => c.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
        
        return data.map(comment => ({
          ...comment,
          is_liked: likedCommentIds.has(comment.id)
        }));
      }

      return data || [];
    },
    enabled: isOpen && !!postId
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          content,
          post_id: postId,
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully!",
      });
    },
    onError: (error) => {
      console.error('Add comment error:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (isLiked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate(newComment.trim());
  };

  const handleLikeComment = (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }
    
    likeCommentMutation.mutate({ commentId, isLiked });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0 z-50">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg">Comments</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{postTitle}</p>
        </DialogHeader>

        {/* Comments List */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                   <Avatar className="h-8 w-8 mt-1">
                     <AvatarImage src={comment.profiles?.[0]?.profile_picture_url} />
                     <AvatarFallback className="text-xs">
                       {comment.profiles?.[0]?.full_name?.[0] || 'U'}
                     </AvatarFallback>
                   </Avatar>
                   
                   <div className="flex-1 min-w-0">
                     <div className="bg-muted rounded-lg p-3">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-semibold text-sm">
                           {comment.profiles?.[0]?.full_name || 'Anonymous User'}
                         </span>
                         <span className="text-xs text-muted-foreground">
                           {formatTimeAgo(comment.created_at)}
                         </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 pl-3">
                      <button
                        onClick={() => handleLikeComment(comment.id, false)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Heart 
                          className="h-3 w-3" 
                        />
                        {comment.likes_count > 0 && comment.likes_count}
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Reply className="h-3 w-3 inline mr-1" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[40px] max-h-20 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};