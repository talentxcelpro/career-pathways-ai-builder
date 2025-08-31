import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useReelComments } from '@/hooks/useReelComments';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReelCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
  className?: string;
}

export const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({
  isOpen,
  onClose,
  reelId,
  className
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const { comments, addComment, isLoading, isAddingComment } = useReelComments(reelId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Reset comment input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-lg bg-background rounded-t-3xl shadow-xl",
        "animate-in slide-in-from-bottom-2 duration-300",
        "max-h-[70vh] flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>
                      {comment.user_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-foreground break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        {user && (
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-full border-muted"
                  disabled={isAddingComment}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  disabled={!newComment.trim() || isAddingComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};