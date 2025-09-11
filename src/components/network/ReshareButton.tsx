import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Users, Link, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReshareButtonProps {
  postId: string;
  postContent: string;
  postAuthor: string;
  postUrl?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ReshareButton: React.FC<ReshareButtonProps> = ({
  postId,
  postContent,
  postAuthor,
  postUrl,
  className,
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reshareText, setReshareText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleReshare = async (withComment: boolean = false) => {
    if (!user) {
      toast.error('Please log in to reshare posts');
      return;
    }

    if (withComment && !reshareText.trim()) {
      toast.error('Please add a comment to reshare');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: withComment ? reshareText : `Reshared from ${postAuthor}`,
          original_post_id: postId,
          post_type: 'reshare',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Post reshared successfully!');
      setIsOpen(false);
      setReshareText('');
    } catch (error) {
      console.error('Reshare error:', error);
      toast.error('Failed to reshare post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = postUrl || `${window.location.origin}/posts/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareToSocial = (platform: string) => {
    const text = `Check out this post by ${postAuthor} on TalentXcel.in`;
    const url = postUrl || `${window.location.origin}/posts/${postId}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=TalentXcel`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={size}
            className={`gap-1 hover-scale ${className}`}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Reshare</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleReshare(false)}>
            <Share2 className="mr-2 h-4 w-4" />
            Quick Reshare
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Reshare with Comment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleShareToSocial('linkedin')}>
            <Users className="mr-2 h-4 w-4" />
            Share to LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShareToSocial('twitter')}>
            <Share2 className="mr-2 h-4 w-4" />
            Share to Twitter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reshare with Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Original post by {postAuthor}:</p>
              <p className="text-sm line-clamp-3">{postContent}</p>
            </div>
            <Textarea
              placeholder="Add your thoughts about this post..."
              value={reshareText}
              onChange={(e) => setReshareText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleReshare(true)}
                disabled={isSubmitting || !reshareText.trim()}
              >
                {isSubmitting ? 'Sharing...' : 'Reshare'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};