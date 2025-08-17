import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Link,
  MessageSquare,
  Users,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareContent {
  id: string;
  type: 'post' | 'reel' | 'job' | 'article';
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

interface EnhancedShareButtonProps {
  content: ShareContent;
  sharesCount?: number;
  onShareComplete?: (platform: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

export const EnhancedShareButton: React.FC<EnhancedShareButtonProps> = ({
  content,
  sharesCount = 0,
  onShareComplete,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  // Build a canonical app URL (avoid sharing raw storage URLs)
  const getShareUrl = () => {
    const base = window.location.origin;
    const pathMap: Record<string, string> = {
      post: `/network/posts/${content.id}`,
      reel: `/network/posts/${content.id}`,
      job: `/jobs/${content.id}`,
      article: `/network/articles/${content.id}`,
    };
    return `${base}${pathMap[content.type] ?? `/network/posts/${content.id}`}`;
  };
  const shareUrl = getShareUrl();
  const shareTitle = content.title;
  const shareDescription = content.description || '';

  // Track share mutation
  const trackShareMutation = useMutation({
    mutationFn: async (platform: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: content.id,
          user_id: user.id,
          shared_to: platform
        });

      if (error) throw error;
    },
    onSuccess: (_, platform) => {
      onShareComplete?.(platform);
      queryClient.invalidateQueries({ queryKey: ['post-shares', content.id] });
    }
  });

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      action: () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
        trackShareMutation.mutate('facebook');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      action: () => {
        const twitterText = shareMessage || `${shareTitle} ${shareDescription}`.slice(0, 200);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        trackShareMutation.mutate('twitter');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
        trackShareMutation.mutate('linkedin');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-green-600',
      action: () => {
        const whatsappText = `${shareTitle}\n${shareDescription}\n${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank');
        trackShareMutation.mutate('whatsapp');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      action: () => {
        const subject = `Check out: ${shareTitle}`;
        const body = `${shareDescription}\n\n${shareUrl}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = emailUrl;
        trackShareMutation.mutate('email');
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-500',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied",
            description: "The link has been copied to your clipboard.",
          });
          trackShareMutation.mutate('copy_link');
          setIsOpen(false);
        } catch (error) {
          console.error('Copy failed:', error);
          toast({
            title: "Copy Failed",
            description: "Failed to copy link. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        trackShareMutation.mutate('native_share');
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 transition-smooth hover:scale-105 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          {showText && <span>Share</span>}
          {sharesCount > 0 && <span className="text-xs">{sharesCount}</span>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content Preview */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">{shareTitle}</h4>
            {shareDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {shareDescription}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              <span className="truncate">{shareUrl}</span>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a message (optional)</label>
            <Textarea
              placeholder="What do you think about this?"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={option.action}
                >
                  <Icon className={`h-6 w-6 ${option.color}`} />
                  <span className="text-xs">{option.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Native Share (if supported) */}
          {navigator.share && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              More sharing options...
            </Button>
          )}

          {/* Share Stats */}
          {sharesCount > 0 && (
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Shared {sharesCount} times
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};