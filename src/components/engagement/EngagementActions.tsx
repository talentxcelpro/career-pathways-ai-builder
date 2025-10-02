import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeEngagement } from '@/hooks/useRealtimeEngagement';
import { useCrossModuleNotifications } from '@/hooks/useCrossModuleNotifications';
import { Heart, MessageCircle, Share, Bookmark, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementActionsProps {
  contentType: string;
  contentId: string;
  contentOwnerId?: string;
  module: string;
  initialStats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  onComment?: () => void;
  onShare?: () => void;
}

export const EngagementActions: React.FC<EngagementActionsProps> = ({
  contentType,
  contentId,
  contentOwnerId,
  module,
  initialStats = { likes: 0, comments: 0, shares: 0, views: 0 },
  className,
  variant = 'default',
  onComment,
  onShare
}) => {
  const { notifyEngagement } = useCrossModuleNotifications();
  const engagement = useRealtimeEngagement(module);
  const [stats, setStats] = useState(initialStats);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Get current scores from realtime data
  const currentScore = engagement.contentScores.get(contentId);
  const displayStats = currentScore ? {
    likes: currentScore.likes_count,
    comments: currentScore.comments_count,
    shares: currentScore.shares_count,
    views: currentScore.views_count,
    isLiked: stats.isLiked,
    isBookmarked: stats.isBookmarked
  } : stats;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      await engagement.likeContent(contentType, contentId, contentOwnerId);
      setStats(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    } catch (error) {
      console.error('Error liking content:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    // Send cross-module notification for comments
    if (contentOwnerId) {
      notifyEngagement(contentOwnerId, 'comment', contentType, contentId, module);
    }
    onComment?.();
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      await engagement.shareContent(contentType, contentId, contentOwnerId);
      setStats(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));
      onShare?.();
    } catch (error) {
      console.error('Error sharing content:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleBookmark = () => {
    setStats(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked
    }));
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>{displayStats.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{displayStats.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{displayStats.views}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "h-8 px-2 gap-1",
            displayStats.isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("h-3 w-3", displayStats.isLiked && "fill-current")} />
          <span className="text-xs">{displayStats.likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="h-8 px-2 gap-1"
        >
          <MessageCircle className="h-3 w-3" />
          <span className="text-xs">{displayStats.comments}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="h-8 px-2 gap-1"
        >
          <Share className="h-3 w-3" />
          <span className="text-xs">{displayStats.shares}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between pt-3 border-t border-border/40", className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "gap-2 hover:bg-red-50 dark:hover:bg-red-950/20",
            displayStats.isLiked && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-5 w-5", displayStats.isLiked && "fill-current")} />
          <span className="font-medium">{displayStats.likes}</span>
          <span className="hidden sm:inline text-sm">Like</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{displayStats.comments}</span>
          <span className="hidden sm:inline text-sm">Comment</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="gap-2 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          <Share className="h-5 w-5" />
          <span className="font-medium">{displayStats.shares}</span>
          <span className="hidden sm:inline text-sm">Share</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {displayStats.views > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Eye className="h-3 w-3" />
            {displayStats.views}
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
            displayStats.isBookmarked && "text-yellow-500 hover:text-yellow-600"
          )}
        >
          <Bookmark className={cn("h-5 w-5", displayStats.isBookmarked && "fill-current")} />
          <span className="sr-only">bookmark</span>
        </Button>
      </div>
    </div>
  );
};