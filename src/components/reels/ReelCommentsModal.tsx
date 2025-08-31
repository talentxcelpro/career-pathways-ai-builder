import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useReelComments } from '@/hooks/useReelComments';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { comments, addComment, isLoading, isAddingComment } = useReelComments(reelId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isAddingComment) return;

    const trimmedComment = newComment.trim();
    if (trimmedComment.length > 500) {
      toast.error('Comment is too long. Maximum 500 characters allowed.');
      return;
    }

    try {
      setIsComposing(true);
      await addComment(trimmedComment);
      setNewComment('');
      setIsComposing(false);
      // Keep focus on input for continuous commenting
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error adding comment:', error);
      setIsComposing(false);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setNewComment(value);
    }
  };

  const handleInputFocus = () => {
    setIsComposing(true);
  };

  const handleInputBlur = () => {
    if (!newComment.trim()) {
      setIsComposing(false);
    }
  };

  // Reset comment input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
      setIsComposing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm overscroll-contain">
      <div className={cn(
        "w-full max-w-lg bg-background rounded-t-3xl shadow-xl",
        "animate-in slide-in-from-bottom-2 duration-300",
        "max-h-[70vh] flex flex-col", // Reduced height like Instagram
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-semibold">Comments</h3>
            <p className="text-sm text-muted-foreground">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium mb-2">No comments yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "flex gap-3 group hover:bg-muted/30 p-3 rounded-lg transition-colors",
                    index === comments.length - 1 && isAddingComment && "animate-pulse"
                  )}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                      {comment.user_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground break-words">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Comment Input - Enhanced */}
        {user && (
          <div className={cn(
            "border-t bg-background transition-all duration-200",
            isComposing ? "p-4" : "p-4",
            "pb-[max(1rem,env(safe-area-inset-bottom))]"
          )}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3 items-start">
                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={newComment}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Add a comment..."
                      className={cn(
                        "border-0 bg-muted/50 focus:bg-background text-sm transition-all duration-200",
                        "resize-none min-h-[40px] rounded-xl",
                        isComposing && "ring-2 ring-primary/20"
                      )}
                      disabled={isAddingComment}
                      autoComplete="off"
                      maxLength={500}
                    />
                    {newComment.length > 400 && (
                      <div className="absolute right-2 top-2 text-xs text-muted-foreground">
                        {500 - newComment.length}
                      </div>
                    )}
                  </div>
                  
                  {(isComposing || newComment.trim()) && (
                    <div className="flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                      <div className="text-xs text-muted-foreground">
                        {newComment.length}/500 characters
                      </div>
                      <div className="flex gap-2">
                        {newComment.trim() && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewComment('');
                              setIsComposing(false);
                              inputRef.current?.blur();
                            }}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim() || isAddingComment}
                          className={cn(
                            "text-xs font-semibold transition-all duration-200",
                            "disabled:opacity-50"
                          )}
                        >
                          {isAddingComment ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              Posting...
                            </div>
                          ) : (
                            'Post'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
