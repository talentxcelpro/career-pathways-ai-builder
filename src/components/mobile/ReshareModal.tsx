import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useReshare } from '@/hooks/useReshare';
import { Repeat2, User } from 'lucide-react';

interface ReshareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    description: string;
    type: 'job' | 'content';
    author?: {
      name: string;
      avatar?: string;
    };
    company?: string;
  };
}

export const ReshareModal: React.FC<ReshareModalProps> = ({
  isOpen,
  onClose,
  post
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resharePost, isResharing } = useReshare();
  const [comment, setComment] = useState('');

  const handleReshare = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to reshare posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resharePost(post.id, comment.trim() || undefined);
      toast({
        title: "Post Reshared!",
        description: "The post has been reshared to your network.",
      });
      setComment('');
      onClose();
    } catch (error) {
      console.error('Reshare error:', error);
      toast({
        title: "Reshare Failed",
        description: "Unable to reshare the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5" />
            Reshare Post
          </DialogTitle>
        </DialogHeader>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Resharing to your network
              </p>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="mb-4">
          <Textarea
            placeholder="Add a comment to your reshare (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Original Post Preview */}
        <div className="border border-border rounded-lg p-3 mb-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback className="text-xs">
                {post.company?.[0] || post.author?.name?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">
              {post.company || post.author?.name || 'Company'}
            </span>
            {post.type === 'job' && (
              <span className="text-xs text-muted-foreground">• Job</span>
            )}
          </div>
          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
            {post.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {post.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isResharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReshare}
            className="flex-1"
            disabled={isResharing}
          >
            {isResharing ? (
              <>
                <Repeat2 className="h-4 w-4 mr-2 animate-spin" />
                Resharing...
              </>
            ) : (
              <>
                <Repeat2 className="h-4 w-4 mr-2" />
                Reshare
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};