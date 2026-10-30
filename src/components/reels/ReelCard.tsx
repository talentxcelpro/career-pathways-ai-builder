import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VideoReelPlayer } from './VideoReelPlayer';
import { ReelEngagementActions } from './ReelEngagementActions';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelData, useReelViewTracking } from '@/hooks/useReelsData';
import { useReelsEngagement } from '@/hooks/useReelsEngagement';
import { MapPin, Verified, Briefcase, ChevronRight } from 'lucide-react';

interface ReelCardProps {
  reel: ReelData;
  isActive: boolean;
  onComment?: () => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  onComment
}) => {
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { trackView } = useReelViewTracking();
  const { likeReel } = useReelsEngagement();

  const handleVideoLoad = useCallback(() => {
    if (isActive && !hasTrackedView) {
      trackView(reel.id);
      setHasTrackedView(true);
    }
  }, [isActive, hasTrackedView, trackView, reel.id]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (currentTime > 3 && !hasTrackedView) {
      trackView(reel.id, Math.round(currentTime));
      setHasTrackedView(true);
    }
  }, [hasTrackedView, trackView, reel.id]);

  const handleDoubleTapLike = useCallback(() => {
    likeReel({
      reelId: reel.id,
      hasLiked: reel.has_liked
    });
  }, [likeReel, reel.id, reel.has_liked]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* High-Performance Autoplay Video Engine */}
      <VideoReelPlayer
        videoUrl={reel.video_url}
        thumbnailUrl={reel.thumbnail_url}
        isActive={isActive}
        onVideoLoad={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        onDoubleTapLike={handleDoubleTapLike}
        className="absolute inset-0"
      />

      {/* Non-blocking Content Overlay (clicks pass through to video unless on buttons) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none">
        
        {/* Content Area - Bottom Left (TikTok / Shorts Standard Layout) */}
        <div className="absolute bottom-24 left-3.5 right-20 z-20 pointer-events-auto space-y-2">
          {/* Creator Profile */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 ring-2 ring-white/50 shadow-md shrink-0">
              <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-xs">
                {reel.user_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-white font-bold text-sm truncate flex items-center gap-1">
                  @{reel.user_name}
                  <Verified className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
                </h3>
                {reel.talent_score && (
                  <a
                    href="/passport"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold hover:bg-amber-500/30 transition-all shadow-xs"
                  >
                    <span>⚡ {reel.talent_score} TalentScore</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1 text-white/70 text-[10px] truncate">
                {reel.creator_role && <span>{reel.creator_role}</span>}
                {reel.creator_role && reel.location && <span>•</span>}
                {reel.location && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5 text-white/60" />
                    {reel.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {reel.title && (
            <h2 className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-md line-clamp-2">
              {reel.title}
            </h2>
          )}

          {reel.description && (
            <p className="text-white/80 text-xs leading-relaxed max-w-sm drop-shadow-xs line-clamp-2">
              {reel.description}
            </p>
          )}

          {/* Tags & Action Buttons */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <a
              href={`/hire?creator=${encodeURIComponent(reel.user_name)}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-semibold shadow-md transition-all active:scale-95 border border-blue-400/30"
            >
              <Briefcase className="w-3 h-3 text-blue-200" />
              <span>Hire Creator</span>
            </a>

            {reel.tags && reel.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/15 text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Engagement Actions - Bottom Right */}
        <div className="absolute bottom-24 right-3 z-20 pointer-events-auto">
          <ReelEngagementActions
            reel={reel}
            onComment={() => setShowComments(true)}
          />
        </div>
      </div>

      {/* Enhanced Comments Modal */}
      <ReelCommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        reelId={reel.id}
        className="animate-in slide-in-from-bottom-2 duration-300"
      />
    </div>
  );
};
