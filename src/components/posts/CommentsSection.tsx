import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
  isOpen: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, isOpen }) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await (supabase as any)
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique author IDs with proper typing
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

      const { error } = await (supabase as any)
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

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Please write a comment before posting');
      return;
    }
    addCommentMutation.mutate(newComment);
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
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t pt-4">
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
            className="min-h-[80px] resize-none"
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
          <div className="text-sm text-gray-500">Loading comments...</div>
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-sm text-gray-900">
                    {formatDisplayName(comment.profiles)}
                  </div>
                  <div className="text-sm text-gray-800 mt-1">
                    {comment.content}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(comment.created_at)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  );
};
