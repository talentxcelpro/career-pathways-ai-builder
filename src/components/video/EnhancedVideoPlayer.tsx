import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { useVideoViewTracking } from '@/hooks/useVideoViewTracking';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { VideoProgressIndicator } from './VideoProgressIndicator';
import { VideoErrorFallback } from './VideoErrorFallback';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreVertical 
} from 'lucide-react';

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  contentId: string;
  contentType: 'post' | 'reel' | 'story';
  isActive?: boolean;
  autoPlay?: boolean;
  enableSound?: boolean;
  className?: string;
  
  // Engagement props
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  hasLiked?: boolean;
  
  // Event handlers
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onDoubleTap?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  description,
  contentId,
  contentType,
  isActive = true,
  autoPlay = true,
  enableSound = false,
  className,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  hasLiked = false,
  onLike,
  onComment,
  onShare,
  onVideoLoad,
  onTimeUpdate,
  onDoubleTap,
  onSwipeUp,
  onSwipeDown
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Video autoplay hook
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

  // Video analytics tracking
  const { trackVideoView, trackVideoEngagement } = useVideoViewTracking();

  // Swipe gesture handling
  const swipeHandlers = useSwipeGestures({
    onDoubleTap: () => {
      onDoubleTap?.();
      onLike?.();
    },
    onSwipeUp,
    onSwipeDown
  });

  // Track video view when it starts playing
  useEffect(() => {
    if (hasStartedPlaying && isVisible) {
      trackVideoView({
        contentId,
        contentType,
        watchTime,
        completionRate: duration > 0 ? (currentTime / duration) * 100 : 0,
        isLiked: hasLiked
      });
    }
  }, [hasStartedPlaying, isVisible, watchTime, contentId, contentType, currentTime, duration, hasLiked, trackVideoView]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onVideoLoad?.();
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current, video.duration);
    };

    const handleLoadStart = () => {
      setCurrentTime(0);
      setDuration(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onVideoLoad, onTimeUpdate]);

  // Show/hide controls
  const showVideoControls = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  const handleVideoClick = useCallback(() => {
    showVideoControls();
    togglePlay();
  }, [showVideoControls, togglePlay]);

  const handleEngagement = useCallback((type: 'like' | 'comment' | 'share') => {
    trackVideoEngagement(contentId, contentType, type);
    
    switch (type) {
      case 'like':
        onLike?.();
        break;
      case 'comment':
        onComment?.();
        break;
      case 'share':
        onShare?.();
        break;
    }
  }, [contentId, contentType, trackVideoEngagement, onLike, onComment, onShare]);

  if (error) {
    return (
      <VideoErrorFallback
        error={error}
        onRetry={() => window.location.reload()}
        className={className}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full bg-black overflow-hidden", className)}
      {...swipeHandlers}
      onClick={handleVideoClick}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        preload="metadata"
      />

      {/* Video Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <VideoProgressIndicator
          currentTime={currentTime}
          duration={duration}
          className="mx-4 mb-4"
        />
      </div>

      {/* Video Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="text-white bg-black/30 hover:bg-black/50"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="text-white bg-black/30 hover:bg-black/50"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        </div>
      )}

      {/* Content Info Overlay */}
      {(title || description) && (
        <div className="absolute bottom-16 left-4 right-20 z-10">
          {title && (
            <h3 className="text-white font-semibold text-lg mb-1 drop-shadow-lg">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-white/90 text-sm line-clamp-2 drop-shadow-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Engagement Actions Sidebar */}
      <div className="absolute right-4 bottom-16 z-10 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleEngagement('like');
          }}
          className={cn(
            "flex flex-col items-center gap-1 text-white bg-black/30 hover:bg-black/50 h-auto p-3",
            hasLiked && "text-red-500"
          )}
        >
          <Heart className={cn("h-6 w-6", hasLiked && "fill-current")} />
          <span className="text-xs">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleEngagement('comment');
          }}
          className="flex flex-col items-center gap-1 text-white bg-black/30 hover:bg-black/50 h-auto p-3"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs">{commentsCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleEngagement('share');
          }}
          className="flex flex-col items-center gap-1 text-white bg-black/30 hover:bg-black/50 h-auto p-3"
        >
          <Share className="h-6 w-6" />
          <span className="text-xs">{sharesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="flex flex-col items-center gap-1 text-white bg-black/30 hover:bg-black/50 h-auto p-3"
        >
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};