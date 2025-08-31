
import React from 'react';
import { Heart, MessageCircle, Share, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReelsEngagement } from '@/hooks/useReelsEngagement';
import { useFollow } from '@/hooks/useFollow';
import { ReelData } from '@/hooks/useReelsData';

interface ReelEngagementActionsProps {
  reel: ReelData;
  onComment: () => void;
  className?: string;
}

export const ReelEngagementActions: React.FC<ReelEngagementActionsProps> = ({
  reel,
  onComment,
  className
}) => {
  const { likeReel, shareReel, isLiking } = useReelsEngagement();
  const { followUser, isLoading: isFollowing } = useFollow();

  const handleLike = () => {
    likeReel({
      reelId: reel.id,
      hasLiked: reel.has_liked
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/reel/${reel.id}`;
    shareReel({
      reelId: reel.id,
      url: shareUrl,
      title: reel.title
    });
  };

  const handleFollow = () => {
    followUser({
      userId: reel.user_id,
      isFollowing: reel.is_following
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Like */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all",
            reel.has_liked && "text-red-500 bg-red-500/20"
          )}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart className={cn("h-6 w-6", reel.has_liked && "fill-current")} />
        </Button>
        <span className="text-white text-xs font-medium mt-1">
          {formatCount(reel.likes_count)}
        </span>
      </div>

      {/* Comment */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
          onClick={onComment}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <span className="text-white text-xs font-medium mt-1">
          {formatCount(reel.comments_count)}
        </span>
      </div>

      {/* Share */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
          onClick={handleShare}
        >
          <Share className="h-6 w-6" />
        </Button>
        <span className="text-white text-xs font-medium mt-1">
          {formatCount(reel.shares_count)}
        </span>
      </div>

      {/* Follow button */}
      {!reel.is_following && (
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          onClick={handleFollow}
          disabled={isFollowing}
        >
          <UserPlus className="h-5 w-5" />
        </Button>
      )}

      {/* Views */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white"
          disabled
        >
          <Eye className="h-6 w-6" />
        </Button>
        <span className="text-white text-xs font-medium mt-1">
          {formatCount(reel.views_count)}
        </span>
      </div>
    </div>
  );
};
