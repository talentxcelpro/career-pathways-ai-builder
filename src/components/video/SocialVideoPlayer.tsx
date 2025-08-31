import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { useVideoViewTracking } from '@/hooks/useVideoViewTracking';
import { cn } from '@/lib/utils';

interface SocialVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  autoPlay?: boolean;
  enableSound?: boolean;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onWatchTimeUpdate?: (watchTime: number) => void;
  className?: string;
  // Engagement props
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  hasLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  // Double tap to like
  onDoubleTap?: () => void;
  // Video tracking
  contentId?: string;
  contentType?: 'post' | 'reel' | 'story';
}

export const SocialVideoPlayer: React.FC<SocialVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  description,
  autoPlay = true,
  enableSound = false,
  onVideoLoad,
  onTimeUpdate,
  onWatchTimeUpdate,
  className,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  hasLiked = false,
  onLike,
  onComment,
  onShare,
  onDoubleTap,
  contentId,
  contentType = 'post'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const { trackVideoView, trackVideoEngagement } = useVideoViewTracking();

  const {
    containerRef,
    isVisible,
    isPlaying,
    isMuted,
    error,
    watchTime,
    hasStartedPlaying,
    togglePlay,
    toggleMute
  } = useVideoAutoplay(videoRef.current, {
    threshold: 0.75,
    enableSound,
    preloadNext: true
  });

  // Report watch time updates and track views
  useEffect(() => {
    if (onWatchTimeUpdate && watchTime > 0) {
      onWatchTimeUpdate(watchTime);
    }

    // Track video view after user has watched for 3+ seconds
    if (contentId && watchTime > 3000 && videoDuration > 0) {
      const completionRate = Math.min((watchTime / 1000) / videoDuration, 1);
      trackVideoView({
        contentId,
        contentType,
        watchTime,
        completionRate,
        isLiked: hasLiked
      });
    }
  }, [watchTime, onWatchTimeUpdate, contentId, contentType, videoDuration, hasLiked, trackVideoView]);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setVideoDuration(video.duration);
      onVideoLoad?.();
    };

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onVideoLoad, onTimeUpdate]);

  // Handle double tap for like
  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (onDoubleTap || onLike) {
        setShowHeartAnimation(true);
        if (onDoubleTap) {
          onDoubleTap();
        } else if (onLike) {
          onLike();
        }
        
        // Track engagement
        if (contentId) {
          trackVideoEngagement(contentId, contentType, 'like');
        }
        
        setTimeout(() => setShowHeartAnimation(false), 1000);
      }
    } else {
      // Single tap - toggle play
      setTimeout(() => {
        if (Date.now() - lastTap >= 300) {
          togglePlay();
        }
      }, 300);
    }
    setLastTap(now);
  };

  if (error) {
    return (
      <div ref={containerRef} className={cn(
        "relative w-full h-full bg-gray-900 flex items-center justify-center min-h-[400px]",
        className
      )}>
        <div className="text-white text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">Unable to load video</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full h-full group", className)}>
      {/* Main video container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover cursor-pointer"
          src={videoUrl}
          poster={thumbnailUrl}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onClick={handleVideoTap}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Play button overlay (when paused) */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 fill-current" />
            </Button>
          </div>
        )}

        {/* Double tap heart animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="h-20 w-20 text-red-500 fill-current animate-bounce" />
          </div>
        )}

        {/* Video info overlay (bottom left) */}
        {(title || description) && (
          <div className="absolute bottom-4 left-4 text-white max-w-[60%]">
            {title && (
              <h3 className="text-sm font-semibold mb-1 drop-shadow-lg">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs opacity-90 drop-shadow-lg line-clamp-2">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Engagement actions (right side) */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-4">
          {/* Like button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              onClick={onLike}
            >
              <Heart className={cn(
                "h-6 w-6 transition-colors",
                hasLiked ? "fill-red-500 text-red-500" : "text-white"
              )} />
            </Button>
            {likesCount > 0 && (
              <span className="text-white text-xs mt-1 drop-shadow-lg">
                {likesCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              onClick={onComment}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            {commentsCount > 0 && (
              <span className="text-white text-xs mt-1 drop-shadow-lg">
                {commentsCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              onClick={onShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
            {sharesCount > 0 && (
              <span className="text-white text-xs mt-1 drop-shadow-lg">
                {sharesCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Video controls (show on hover for desktop) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity md:block hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};