import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Edit, Trash2, Send, Loader2 } from 'lucide-react';

interface EnhancedCommentsSectionProps {
  postId: string;
  isOpen?: boolean;
}

export const EnhancedCommentsSection: React.FC<EnhancedCommentsSectionProps> = ({ postId, isOpen = true }) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Query real comments from Supabase post_comments table
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) return [];

      // Get unique author IDs
      const authorIds: string[] = Array.from(new Set(
        commentsData
          .map((c: any) => c.author_id || c.user_id)
          .filter((id: any): id is string => typeof id === 'string' && id !== null)
      ));

      if (authorIds.length === 0) {
        return commentsData.map((c: any) => ({ ...c, profiles: null }));
      }

      // Fetch profiles for comment authors
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', authorIds);

      const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

      return commentsData.map((comment: any) => ({
        ...comment,
        profiles: profilesMap.get(comment.author_id || comment.user_id) || null
      }));
    },
    enabled: isOpen
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to comment');

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-engagement-real', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      toast.success('Comment posted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post comment');
    }
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-engagement-real', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    }
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Please write something before posting');
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4 pt-2">
      
      {/* Comment Input Container */}
      <div className="flex gap-2.5 items-start">
        <Avatar className="w-8 h-8 shrink-0 mt-0.5 border border-slate-200">
          <AvatarImage src={undefined} />
          <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">U</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] text-xs rounded-2xl border-slate-200/80 focus-visible:ring-1 focus-visible:ring-primary p-3 resize-none font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="rounded-xl h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Real Comments List */}
      {!isLoading && comments && comments.length > 0 && (
        <div className="space-y-3 pt-2">
          {comments.map((comment: any) => {
            const authorName = comment.profiles?.full_name || "Professional User";
            const authorAvatar = comment.profiles?.profile_picture_url;
            const authorTitle = comment.profiles?.title || "Member";
            const isOwnComment = currentUserId === (comment.author_id || comment.user_id);

            return (
              <div key={comment.id} className="flex gap-2.5 items-start group">
                <Avatar className="w-8 h-8 shrink-0 mt-0.5 border border-slate-200">
                  <AvatarImage src={authorAvatar || undefined} alt={authorName} />
                  <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 bg-slate-50 dark:bg-muted/40 p-3 rounded-2xl border border-slate-200/60 dark:border-border/40 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-xs text-foreground">{authorName}</p>
                      <p className="text-[10px] text-muted-foreground">{authorTitle}</p>
                    </div>

                    {isOwnComment && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => deleteCommentMutation.mutate(comment.id)} className="text-red-600 font-bold">
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-xs text-foreground mt-1.5 font-medium leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};