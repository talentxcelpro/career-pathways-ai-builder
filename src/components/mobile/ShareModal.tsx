import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  WhatsApp
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    description: string;
    type: 'job' | 'content';
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  post
}) => {
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/network/posts/${post.id}`;
  const shareText = `Check out this ${post.type === 'job' ? 'job opportunity' : 'post'}: ${post.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard!",
      });
      onClose();
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          handleCopyLink(); // Fallback to copy
        }
      }
    } else {
      handleCopyLink(); // Fallback for browsers without native share
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const shareOptions = [
    {
      id: 'native',
      label: 'Share',
      icon: Share2,
      action: handleNativeShare,
      description: 'Use device sharing'
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: Copy,
      action: handleCopyLink,
      description: 'Copy to clipboard'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      action: () => handleSocialShare('whatsapp'),
      description: 'Share on WhatsApp'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      action: () => handleSocialShare('linkedin'),
      description: 'Share on LinkedIn'
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      action: () => handleSocialShare('twitter'),
      description: 'Share on Twitter'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      action: () => handleSocialShare('facebook'),
      description: 'Share on Facebook'
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      action: () => handleSocialShare('email'),
      description: 'Share via email'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        {/* Post Preview */}
        <div className="bg-muted rounded-lg p-3 mb-4">
          <h4 className="font-semibold text-sm line-clamp-2 mb-1">{post.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={option.action}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>

        {/* URL Display */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Post URL</span>
          </div>
          <p className="text-xs text-muted-foreground break-all">{shareUrl}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};