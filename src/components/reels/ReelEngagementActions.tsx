
import React from 'react';
import { Heart, MessageCircle, Share, Eye, UserPlus, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReelsEngagement } from '@/hooks/useReelsEngagement';
import { useFollow } from '@/hooks/useFollow';
import { ReelData } from '@/hooks/useReelsData';

interface ReelEngagementActionsProps {
  reel: ReelData;
  onComment: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  className?: string;
}

export const ReelEngagementActions: React.FC<ReelEngagementActionsProps> = ({
  reel,
  onComment,
  isMuted = false, // Default volume ON
  onToggleMute,
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
    <div className={cn("flex flex-col items-center gap-2 touch-manipulation", className)}>

      {/* Follow button */}
      {!reel.is_following && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg touch-manipulation border border-white/20"
          onClick={handleFollow}
          disabled={isFollowing}
        >
          <UserPlus className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Volume (placed after follow) */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 touch-manipulation border border-white/20"
          onClick={onToggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Like */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all touch-manipulation border border-white/20",
            reel.has_liked && "text-red-500 bg-red-500/30"
          )}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart className={cn("h-3.5 w-3.5", reel.has_liked && "fill-current")} />
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
          className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 touch-manipulation border border-white/20"
          onClick={onComment}
        >
          <MessageCircle className="h-3.5 w-3.5" />
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
          className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 touch-manipulation border border-white/20"
          onClick={handleShare}
        >
          <Share className="h-3.5 w-3.5" />
        </Button>
        <span className="text-white text-xs font-medium mt-1">
          {formatCount(reel.shares_count)}
        </span>
      </div>

      {/* Views - Emphasized */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-blue-500/40 backdrop-blur-sm text-white touch-manipulation border border-blue-300/40"
          disabled
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <span className="text-white text-xs font-bold mt-1 bg-blue-500/20 px-2 py-1 rounded-full">
          {formatCount(reel.views_count)}
        </span>
      </div>
    </div>
  );
};
