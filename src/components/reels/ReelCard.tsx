
import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoReelPlayer } from './VideoReelPlayer';
import { ReelEngagementActions } from './ReelEngagementActions';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelData } from '@/hooks/useReelsData';
import { useReelViewTracking } from '@/hooks/useReelsData';
import { formatDistanceToNow } from 'date-fns';

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
  const [isMuted, setIsMuted] = useState(false); // Default volume ON
  
  const { trackView } = useReelViewTracking();

  const handleVideoLoad = useCallback(() => {
    if (isActive && !hasTrackedView) {
      trackView(reel.id);
      setHasTrackedView(true);
    }
  }, [isActive, hasTrackedView, trackView, reel.id]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (currentTime > 3 && !hasTrackedView) {
      trackView(reel.id, Math.floor(currentTime));
      setHasTrackedView(true);
    }
  }, [hasTrackedView, trackView, reel.id]);

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen bg-black flex">
      {/* Video Player */}
      <div className="flex-1 relative">
        <VideoReelPlayer
          videoUrl={reel.video_url}
          thumbnailUrl={reel.thumbnail_url}
          isActive={isActive}
          onVideoLoad={handleVideoLoad}
          onTimeUpdate={handleTimeUpdate}
          onPlayStateChange={(playing) => console.log('Video playing:', playing)}
          muted={isMuted}
          className="w-full h-full"
        />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-16 p-2 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
          {/* User Info */}
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white">
              <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
              <AvatarFallback className="bg-gray-700 text-white">
                {reel.user_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-semibold text-xs md:text-sm">
                @{reel.user_name}
              </p>
              <p className="text-gray-300 text-xs">
                {formatDistanceToNow(new Date(reel.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1 md:space-y-2">
            {reel.title && (
              <h3 className="text-white font-medium text-sm md:text-base leading-tight">
                {reel.title}
              </h3>
            )}
            
            {reel.description && (
              <p className="text-gray-200 text-xs md:text-sm leading-relaxed">
                {reel.description}
              </p>
            )}

            {/* Tags */}
            {reel.tags && reel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reel.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-300 text-xs md:text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Actions */}
      <div className="absolute right-2 bottom-20 md:bottom-24 z-20">
        <ReelEngagementActions
          reel={reel}
          onComment={() => setShowComments(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          className="p-1"
        />
      </div>

      {/* Comments Modal */}
      <ReelCommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        reelId={reel.id}
      />
    </div>
  );
};
