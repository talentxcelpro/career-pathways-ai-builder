
import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VideoReelPlayer } from './VideoReelPlayer';
import { ReelEngagementActions } from './ReelEngagementActions';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelData, useReelViewTracking } from '@/hooks/useReelsData';
import { useReelsEngagement } from '@/hooks/useReelsEngagement';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Verified, Briefcase, Sparkles, ChevronRight } from 'lucide-react';

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
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40 pointer-events-none">
        {/* Top Creator Info & Career Passport */}
        <div className="absolute top-12 left-4 right-20 z-20 pointer-events-auto">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-white/40 shadow-xl flex-shrink-0">
              <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-sm">
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold hover:bg-amber-500/30 transition-all shadow-sm"
                  >
                    <span>⚡ {reel.talent_score} TalentScore</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-white/75 text-[11px] mt-0.5 truncate">
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
        </div>

        {/* Content Area - Bottom Left */}
        <div className="absolute bottom-28 left-4 right-20 z-20 pointer-events-auto space-y-2.5">
          {reel.title && (
            <h2 className="text-white font-bold text-base leading-snug drop-shadow-md line-clamp-2">
              {reel.title}
            </h2>
          )}

          {reel.description && (
            <p className="text-white/90 text-xs leading-relaxed max-w-sm drop-shadow-sm line-clamp-2">
              {reel.description}
            </p>
          )}

          {/* Tags */}
          {reel.tags && reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {reel.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm transition-all"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Two-Way Recruiter & Job Action Pills */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <a
              href={`/hire?creator=${encodeURIComponent(reel.user_name)}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 border border-blue-400/40"
            >
              <Briefcase className="w-3 h-3 text-blue-200" />
              <span>Hire Creator</span>
            </a>

            {reel.related_job_query && (
              <a
                href={`/jobs?q=${encodeURIComponent(reel.related_job_query)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[11px] font-medium backdrop-blur-md border border-white/20 transition-all"
              >
                <span>🔥 {reel.related_job_query} Jobs</span>
                <ChevronRight className="w-3 h-3 text-white/60" />
              </a>
            )}
          </div>
        </div>

        {/* Engagement Actions - Bottom Right */}
        <div className="absolute bottom-28 right-3.5 z-20 pointer-events-auto">
          <ReelEngagementActions
            reel={reel}
            onComment={() => setShowComments(true)}
            className="transform hover:scale-105 transition-transform"
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
