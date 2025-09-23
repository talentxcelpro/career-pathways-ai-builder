import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface VideoReelPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  muted?: boolean;
  className?: string;
}

export const VideoReelPlayer: React.FC<VideoReelPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  isActive,
  onVideoLoad,
  onTimeUpdate,
  onPlayStateChange,
  muted = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [internalMuted, setInternalMuted] = useState(muted);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [actuallyPlaying, setActuallyPlaying] = useState(false);
  const [showClickToPlay, setShowClickToPlay] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Handle video play with better error handling and user interaction
  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    try {
      video.muted = internalMuted;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setActuallyPlaying(true);
        setShowClickToPlay(false);
        onPlayStateChange?.(true);
        console.log('Video playing successfully');
      }
    } catch (error) {
      console.warn('Initial play failed, trying muted:', error);
      
      // Try muted autoplay for browser restrictions
      try {
        video.muted = true;
        setInternalMuted(true);
        await video.play();
        setActuallyPlaying(true);
        setShowClickToPlay(false);
        onPlayStateChange?.(true);
        console.log('Video playing muted due to autoplay policy');
      } catch (mutedError) {
        console.error('Muted autoplay also failed:', mutedError);
        setError(false); // Don't show error immediately
        setShowClickToPlay(true); // Show click to play instead
        setActuallyPlaying(false);
        onPlayStateChange?.(false);
      }
    }
  }, [isActive, internalMuted, onPlayStateChange]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.pause();
    setActuallyPlaying(false);
    setShowClickToPlay(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  // Handle user click for manual play
  const handleUserPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    
    try {
      video.muted = internalMuted;
      await video.play();
      setActuallyPlaying(true);
      setShowClickToPlay(false);
      setError(false);
      onPlayStateChange?.(true);
    } catch (error) {
      console.error('User-initiated play failed:', error);
      setError(true);
      onPlayStateChange?.(false);
    }
  }, [internalMuted, onPlayStateChange]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    
    if (actuallyPlaying) {
      pauseVideo();
    } else {
      await handleUserPlay();
    }
  }, [actuallyPlaying, pauseVideo, handleUserPlay]);

  // Toggle mute with user interaction
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    const newMuted = !internalMuted;
    setInternalMuted(newMuted);
    video.muted = newMuted;
  }, [internalMuted]);

  // Main effect for play/pause logic
  useEffect(() => {
    if (isActive) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive, playVideo, pauseVideo]);

  // Sync muted prop with internal state
  useEffect(() => {
    if (!hasUserInteracted) {
      setInternalMuted(muted);
    }
  }, [muted, hasUserInteracted]);

  const handleLoadedData = () => {
    setIsLoading(false);
    onVideoLoad?.();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      onTimeUpdate?.(video.currentTime);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-900", className)}>
        <div className="text-center text-white">
          <p className="text-lg mb-2">😞</p>
          <p className="text-sm">Failed to load video</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Click to play overlay */}
      {showClickToPlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Button
            onClick={handleUserPlay}
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <Play className="h-8 w-8 mr-2" />
            Click to Play
          </Button>
        </div>
      )}

      {/* Video Controls */}
      {isActive && !showClickToPlay && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 z-20",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Center play/pause button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlayPause}
              size="lg"
              variant="ghost"
              className="h-16 w-16 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
            >
              {actuallyPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Top right controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {hasUserInteracted && (
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="bg-black/30 hover:bg-black/50 text-white border-0"
              >
                {internalMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hover to show controls */}
      {isActive && !showClickToPlay && !showControls && (
        <div 
          className="absolute inset-0 z-10"
          onMouseEnter={() => setShowControls(true)}
          onClick={togglePlayPause}
        />
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={internalMuted}
        preload="metadata"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onClick={showClickToPlay ? handleUserPlay : undefined}
      />
    </div>
  );
};