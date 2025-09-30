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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';

interface EnhancedCommentsSectionProps {
  postId: string;
  isOpen: boolean;
}

export const EnhancedCommentsSection: React.FC<EnhancedCommentsSectionProps> = ({ postId, isOpen }) => {
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

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique author IDs
      const authorIds: string[] = Array.from(new Set(
        commentsData
          .map((comment: any) => comment.author_id)
          .filter((id: any): id is string => typeof id === 'string' && id !== null)
      ));

      if (authorIds.length === 0) {
        return commentsData.map((comment: any) => ({ ...comment, profiles: null }));
      }

      // Get profiles for all comment authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url')
        .in('id', authorIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map(profilesData.map((profile: any) => [profile.id, profile]));

      // Combine comments with their profiles
      const commentsWithProfiles = commentsData.map((comment: any) => ({
        ...comment,
        profiles: profilesMap.get(comment.author_id) || null
      }));

      return commentsWithProfiles;
    },
    enabled: isOpen
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      toast.success('Comment added!');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    }
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { error } = await supabase
        .from('post_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Comment updated!');
    },
    onError: (error) => {
      toast.error('Failed to update comment');
      console.error('Edit comment error:', error);
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Comment deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete comment');
      console.error('Delete comment error:', error);
    }
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Please write a comment before posting');
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    if (editingCommentId) {
      editCommentMutation.mutate({ commentId: editingCommentId, content: editContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleReportComment = () => {
    const reason = window.prompt('Why are you reporting this comment?');
    if (reason) {
      toast.success('Comment reported successfully');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (profile?.display_name && profile.display_name.trim()) {
      return profile.display_name;
    }
    if (profile?.username && profile.username.trim()) {
      return `@${profile.username}`;
    }
    return 'TalentXcel User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'TalentXcel User') return 'TU';
    if (displayName.startsWith('@')) return displayName.charAt(1).toUpperCase();
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t pt-4 max-h-[500px] overflow-y-auto">
      {/* Add Comment Form */}
      <div className="flex space-x-3 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] max-h-[100px] resize-none text-sm"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending || !newComment.trim()}
              size="sm"
            >
              {addCommentMutation.isPending ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading comments...</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.profile_picture_url} />
                <AvatarFallback>
                  {generateInitials(comment.profiles)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit}
                        disabled={editCommentMutation.isPending || !editContent.trim()}
                      >
                        {editCommentMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {formatDisplayName(comment.profiles)}
                        </div>
                        <div className="text-sm mt-1">
                          {comment.content}
                        </div>
                      </div>
                      
                      {/* Comment Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {currentUserId === comment.author_id && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          {currentUserId !== comment.author_id && (
                            <DropdownMenuItem 
                              onClick={handleReportComment}
                              className="text-destructive focus:text-destructive"
                            >
                              <Flag className="h-3 w-3 mr-2" />
                              Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
                
                {editingCommentId !== comment.id && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(comment.created_at)}
                    {comment.updated_at !== comment.created_at && (
                      <span className="ml-1">(edited)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  );
};