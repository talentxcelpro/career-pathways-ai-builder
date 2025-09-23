import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VideoReelPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  muted?: boolean;
  className?: string;
}

export const VideoReelPlayer: React.FC<VideoReelPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  isActive,
  onVideoLoad,
  onTimeUpdate,
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
        console.log('Video playing muted due to autoplay policy');
      } catch (mutedError) {
        console.error('Muted autoplay also failed:', mutedError);
        setError(false); // Don't show error immediately
        setShowClickToPlay(true); // Show click to play instead
        setActuallyPlaying(false);
      }
    }
  }, [isActive, internalMuted]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.pause();
    video.currentTime = 0;
    setActuallyPlaying(false);
    setShowClickToPlay(false);
  }, []);

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
    } catch (error) {
      console.error('User-initiated play failed:', error);
      setError(true);
    }
  }, [internalMuted]);

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

      {/* Mute toggle for active videos */}
      {isActive && actuallyPlaying && hasUserInteracted && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            onClick={toggleMute}
            size="sm"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            {internalMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
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