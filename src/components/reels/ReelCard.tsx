
import React, { useState, useCallback, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VideoReelPlayer } from './VideoReelPlayer';
import { ReelEngagementActions } from './ReelEngagementActions';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelData } from '@/hooks/useReelsData';
import { useReelViewTracking } from '@/hooks/useReelsData';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Verified } from 'lucide-react';

interface ReelCardProps {
  reel: ReelData;
  isActive: boolean;
  onComment: () => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  onComment
}) => {
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackView } = useReelViewTracking();
  
  // Enhanced autoplay with intersection observer
  const {
    containerRef,
    isVisible,
    isPlaying,
    isMuted,
    toggleMute,
    watchTime,
    hasStartedPlaying
  } = useVideoAutoplay(videoRef.current, {
    threshold: 0.75, // Play when 75% visible
    enableSound: false, // Start muted for autoplay policy
    preloadNext: true
  });

  const handleVideoLoad = useCallback(() => {
    if (isActive && !hasTrackedView && hasStartedPlaying) {
      trackView(reel.id);
      setHasTrackedView(true);
    }
  }, [isActive, hasTrackedView, trackView, reel.id, hasStartedPlaying]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (currentTime > 3 && !hasTrackedView) {
      trackView(reel.id, Math.round(watchTime / 1000));
      setHasTrackedView(true);
    }
  }, [hasTrackedView, trackView, reel.id, watchTime]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {/* Enhanced Video Player with Auto-play */}
      <VideoReelPlayer
        videoUrl={reel.video_url}
        thumbnailUrl={reel.thumbnail_url}
        isActive={isActive && isVisible}
        onVideoLoad={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        muted={isMuted}
        className="absolute inset-0"
      />

      {/* Enhanced Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20">
        {/* Top User Info - Instagram Style */}
        <div className="absolute top-12 left-4 right-20 z-10">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 ring-2 ring-white/40 shadow-lg">
              <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold">
                {reel.user_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-base truncate flex items-center gap-1">
                  @{reel.user_name}
                  <Verified className="h-4 w-4 text-blue-400" />
                </h3>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span>{formatDistanceToNow(new Date(reel.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>Professional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Enhanced */}
        <div className="absolute bottom-32 left-4 right-20 z-10">
          <div className="space-y-4">
            {reel.title && (
              <h2 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
                {reel.title}
              </h2>
            )}
            
            {reel.description && (
              <p className="text-white/95 text-sm leading-relaxed max-w-xs drop-shadow-md">
                {reel.description.length > 100 
                  ? `${reel.description.substring(0, 100)}...` 
                  : reel.description
                }
              </p>
            )}
            
            {/* Enhanced Tags */}
            {reel.tags && reel.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reel.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg transition-all hover:scale-105"
                  >
                    #{tag}
                  </Badge>
                ))}
                {reel.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-white/15 backdrop-blur-md text-white/70 text-xs px-3 py-1 rounded-full border border-white/20"
                  >
                    +{reel.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-white/80 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                {reel.views_count?.toLocaleString() || 0} views
              </span>
              {watchTime > 3000 && (
                <span className="px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                  Watched {Math.round(watchTime / 1000)}s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Engagement Actions */}
        <div className="absolute bottom-32 right-4 z-10">
          <ReelEngagementActions
            reel={reel}
            onComment={() => setShowComments(true)}
            isMuted={isMuted}
            onToggleMute={toggleMute}
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
