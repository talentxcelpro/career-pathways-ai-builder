import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: {
    full_name: string;
    profile_picture_url?: string;
  };
}

interface MobilePostCommentsProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded?: () => void;
}

export const MobilePostComments: React.FC<MobilePostCommentsProps> = ({
  isOpen,
  onClose,
  postId,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  // Real-time updates for comments
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('id, content, created_at, author_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique author IDs
      const authorIds = [...new Set(commentsData.map(c => c.author_id))];

      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url')
        .in('id', authorIds);

      // Create profile map
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Combine comments with profile data
      const formattedComments = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author_id: comment.author_id,
        author: {
          full_name: profilesMap.get(comment.author_id)?.full_name || 'TalentXcel User',
          profile_picture_url: profilesMap.get(comment.author_id)?.profile_picture_url
        }
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      
      // Refresh comments to show the new one
      await loadComments();
      
      // Notify parent to update count
      onCommentAdded?.();
      
      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[80vh] p-0 max-w-md mx-auto flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle className="text-center text-lg font-semibold">
            Comments
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet.</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.author.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {comment.author.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <p className="font-semibold text-sm">{comment.author.full_name}</p>
                      <p className="text-sm text-gray-700 mt-1 break-words">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 px-3 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Comment Input */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex gap-3 items-center">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                className="border-none bg-gray-100 rounded-full px-4 py-2 focus:bg-white focus:border focus:border-gray-300"
                disabled={submitting}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="rounded-full h-9 w-9 p-0"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
