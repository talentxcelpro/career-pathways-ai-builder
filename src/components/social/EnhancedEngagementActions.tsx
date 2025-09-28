import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Share2, Bookmark, Copy, ExternalLink } from 'lucide-react';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';
import { useRealtimeEngagement } from '@/hooks/useRealtimeEngagement';
import { CommentsSection } from './CommentsSection';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedEngagementActionsProps {
  postId: string;
  postType: 'post' | 'reel' | 'job';
  postUrl?: string;
  postTitle?: string;
  authorId?: string;
  className?: string;
  variant?: 'default' | 'mobile' | 'compact';
}

export const EnhancedEngagementActions: React.FC<EnhancedEngagementActionsProps> = ({
  postId,
  postType,
  postUrl,
  postTitle,
  authorId,
  className,
  variant = 'default'
}) => {
  const { interactions, toggleLike, toggleBookmark, isLiking, isBookmarking } = useSocialInteractions(postId);
  const { publishEvent, likeContent, shareContent } = useRealtimeEngagement('social');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Enhanced like handler with real-time updates
  const handleLike = async () => {
    try {
      await toggleLike();
      await likeContent(postType, postId, authorId);
      
      // Add haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  // Enhanced share handler
  const handleShare = async (platform?: string) => {
    const shareUrl = postUrl || `${window.location.origin}/posts/${postId}`;
    const shareText = postTitle || `Check out this ${postType} on TalentXcel`;
    
    setIsSharing(true);
    
    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        setShowShareModal(false);
        await shareContent(postType, postId, authorId);
        return;
      }

      if (navigator.share && !platform) {
        await navigator.share({
          title: shareText,
          text: 'Check out this post on TalentXcel',
          url: shareUrl,
        });
        toast.success('Post shared successfully!');
        await shareContent(postType, postId, authorId);
      } else if (platform) {
        // Social platform sharing
        const shareUrls = {
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
          telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        };

        const targetUrl = shareUrls[platform as keyof typeof shareUrls];
        if (targetUrl) {
          window.open(targetUrl, '_blank', 'width=600,height=400');
          toast.success('Opening share dialog...');
          await shareContent(postType, postId, authorId);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share post');
    } finally {
      setIsSharing(false);
      setShowShareModal(false);
    }
  };

  const isMobile = variant === 'mobile';
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "flex items-center",
      isMobile ? "justify-around py-4" : "justify-between",
      className
    )}>
      <div className={cn(
        "flex items-center",
        isMobile ? "gap-8" : "gap-1"
      )}>
        {/* Enhanced Like Button */}
        <Button
          variant="ghost"
          size={isMobile ? "lg" : "sm"}
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "gap-2 transition-all duration-200",
            isMobile && "flex-col h-auto py-2 px-4",
            interactions.isLiked 
              ? "text-red-600 hover:text-red-700 scale-105" 
              : "text-gray-600 hover:text-red-600"
          )}
        >
          <Heart 
            className={cn(
              isMobile ? "h-6 w-6" : "h-4 w-4",
              interactions.isLiked && "fill-current animate-pulse"
            )} 
          />
          {!isCompact && (
            <span className={cn(isMobile ? "text-xs" : "text-sm")}>
              {isMobile && interactions.likesCount > 0 
                ? interactions.likesCount 
                : "Like"
              }
            </span>
          )}
        </Button>

        {/* Enhanced Comment Button */}
        <CommentsSection
          postId={postId}
          commentsCount={interactions.commentsCount}
          onCommentAdded={() => {
            publishEvent('comment', postType, postId, authorId);
          }}
        />

        {/* Enhanced Share Button */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size={isMobile ? "lg" : "sm"}
              disabled={isSharing}
              className={cn(
                "gap-2 text-gray-600 hover:text-blue-600 transition-colors",
                isMobile && "flex-col h-auto py-2 px-4"
              )}
            >
              <Share2 className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
              {!isCompact && (
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>
                  {isMobile && interactions.sharesCount > 0 
                    ? interactions.sharesCount 
                    : "Share"
                  }
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share {postType}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-sky-500 rounded"></div>
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare('telegram')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  Telegram
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare('copy')}
                  className="flex-1 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare()}
                  className="flex-1 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  More Options
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Bookmark Button */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleBookmark()}
          disabled={isBookmarking}
          className={cn(
            "gap-1 transition-all duration-200",
            interactions.isBookmarked 
              ? "text-yellow-600 scale-105" 
              : "text-gray-600 hover:text-yellow-600"
          )}
        >
          <Bookmark className={cn(
            "h-4 w-4",
            interactions.isBookmarked && "fill-current"
          )} />
        </Button>
      )}
    </div>
  );
};