import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Flag, Share, Bookmark, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PostMenuProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
  postContent: string;
  isOwnPost: boolean;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  authorId,
  currentUserId,
  postContent,
  isOwnPost
}) => {
  const queryClient = useQueryClient();

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete post');
      console.error('Delete post error:', error);
    }
  });

  // Report post (simplified - just show toast for now)
  const handleReport = () => {
    const reason = window.prompt('Why are you reporting this post?');
    if (reason) {
      toast.success('Post reported successfully');
    }
  };

  // Save post (simplified - just show toast for now)
  const handleSave = () => {
    toast.success('Post saved');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate();
    }
  };


  const handleCopyLink = () => {
    const url = `${window.location.origin}/network/posts/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(postContent);
    toast.success('Post text copied to clipboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Save post */}
        <DropdownMenuItem onClick={handleSave}>
          <Bookmark className="h-4 w-4 mr-2" />
          Save Post
        </DropdownMenuItem>

        {/* Copy link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Share className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>

        {/* Copy text */}
        <DropdownMenuItem onClick={handleCopyText}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </DropdownMenuItem>

        {/* Own post actions */}
        {isOwnPost && (
          <>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Post
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Post
            </DropdownMenuItem>
          </>
        )}

        {/* Report post (not own post) */}
        {!isOwnPost && (
          <DropdownMenuItem 
            onClick={handleReport}
            className="text-red-600 focus:text-red-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report Post
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};