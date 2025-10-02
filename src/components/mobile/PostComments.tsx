import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getUserAvatarProps } from '@/utils/avatarUtils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Heart, 
  Send, 
  ArrowLeft,
  Reply,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

interface PostCommentsProps {
  postId: string;
  onClose: () => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Fetch comments from database
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles!post_comments_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            title
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!postId
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          content,
          post_id: postId,
          author_id: user.id,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['network-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment posted successfully!');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to post comment');
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment, parentId: replyTo || undefined });
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo(commentId);
    setNewComment(`@${userName} `);
  };

  // Organize comments in thread structure
  const organizeComments = (comments: Comment[]) => {
    const topLevelComments = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    
    return topLevelComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parent_id === comment.id)
    }));
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Comments</h1>
        <div className="w-10" />
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : organizedComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            organizedComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <Card className="border-0 shadow-none bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <UserAvatar 
                        src={comment.profiles?.profile_picture_url}
                        userName={comment.profiles?.full_name || 'User'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {comment.profiles?.full_name || 'User'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {comment.profiles?.title && (
                          <p className="text-xs text-gray-600 mb-2">{comment.profiles.title}</p>
                        )}
                        <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleReply(comment.id, comment.profiles?.full_name || 'User')}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {comment.replies.map((reply) => (
                      <Card key={reply.id} className="border-0 shadow-none bg-white">
                        <CardContent className="p-3">
                          <div className="flex gap-2">
                            <UserAvatar 
                              src={reply.profiles?.profile_picture_url}
                              userName={reply.profiles?.full_name || 'User'}
                              size="xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-xs text-gray-900">
                                  {reply.profiles?.full_name || 'User'}
                                </h5>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-800 leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t bg-white p-4">
        {replyTo && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
            Replying to comment...
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-6 px-2 text-xs"
              onClick={() => {
                setReplyTo(null);
                setNewComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <UserAvatar 
            {...getUserAvatarProps(user)}
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px] max-h-24 resize-none border-gray-200 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="h-10 w-10 rounded-xl shrink-0"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};