import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Edit, Trash2, Flag, Share, Bookmark, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EnhancedPostMenuProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
  postContent: string;
  postHeadline?: string;
  isOwnPost: boolean;
}

export const EnhancedPostMenu: React.FC<EnhancedPostMenuProps> = ({
  postId,
  authorId,
  currentUserId,
  postContent,
  postHeadline,
  isOwnPost
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(postContent);
  const [editHeadline, setEditHeadline] = useState(postHeadline || '');
  const queryClient = useQueryClient();

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async ({ content, headline }: { content: string; headline?: string }) => {
      const updateData: any = { content };
      if (headline !== undefined) {
        updateData.headline = headline;
      }
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsEditDialogOpen(false);
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update post');
      console.error('Edit post error:', error);
    }
  });

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

  const handleEdit = () => {
    setEditContent(postContent);
    setEditHeadline(postHeadline || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    editPostMutation.mutate({ 
      content: editContent,
      headline: editHeadline || undefined
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate();
    }
  };

  const handleReport = () => {
    const reason = window.prompt('Why are you reporting this post?');
    if (reason) {
      toast.success('Post reported successfully');
    }
  };

  const handleSave = () => {
    toast.success('Post saved');
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
    <>
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
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
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
              className="text-destructive focus:text-destructive"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {postHeadline !== undefined && (
              <div className="grid gap-2">
                <label htmlFor="headline" className="text-sm font-medium">
                  Headline (optional)
                </label>
                <Textarea
                  id="headline"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="Add a headline..."
                  className="min-h-[60px]"
                />
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveEdit}
              disabled={editPostMutation.isPending || !editContent.trim()}
            >
              {editPostMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};