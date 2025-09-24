import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Volume1, AlertCircle } from 'lucide-react';

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
  const [volume, setVolume] = useState(1);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [actuallyPlaying, setActuallyPlaying] = useState(false);
  const [showClickToPlay, setShowClickToPlay] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Handle video play with better error handling and user interaction
  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    // Don't attempt autoplay without user interaction
    if (!hasUserInteracted) {
      setShowClickToPlay(true);
      return;
    }

    try {
      video.muted = internalMuted;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setActuallyPlaying(true);
        setShowClickToPlay(false);
        setError(false);
        onPlayStateChange?.(true);
        console.log('Video playing successfully');
      }
    } catch (error) {
      console.warn('Play failed, showing click to play:', error);
      setShowClickToPlay(true);
      setActuallyPlaying(false);
      setError(false);
      onPlayStateChange?.(false);
    }
  }, [isActive, internalMuted, hasUserInteracted, onPlayStateChange]);

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
    if (!video || !hasUserInteracted) return;

    setHasUserInteracted(true);
    const newMuted = !internalMuted;
    setInternalMuted(newMuted);
    video.muted = newMuted;
    console.log(`Volume ${newMuted ? 'muted' : 'unmuted'}`);
  }, [internalMuted, hasUserInteracted]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const video = videoRef.current;
    if (!video || !hasUserInteracted) return;

    const volumeLevel = newVolume[0] / 100;
    setVolume(volumeLevel);
    video.volume = volumeLevel;
    
    // Auto unmute when volume is increased from 0
    if (volumeLevel > 0 && internalMuted) {
      setInternalMuted(false);
      video.muted = false;
    }
    // Auto mute when volume is set to 0
    if (volumeLevel === 0 && !internalMuted) {
      setInternalMuted(true);
      video.muted = true;
    }
  }, [hasUserInteracted, internalMuted]);

  // Get volume icon based on current volume level
  const getVolumeIcon = useCallback(() => {
    if (internalMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [internalMuted, volume]);

  // Main effect for play/pause logic
  useEffect(() => {
    if (isActive) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive, playVideo, pauseVideo]);

  // Sync volume with video element
  useEffect(() => {
    const video = videoRef.current;
    if (video && hasUserInteracted) {
      video.volume = volume;
    }
  }, [volume, hasUserInteracted]);

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
      {(showClickToPlay || !hasUserInteracted) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Button
            onClick={handleUserPlay}
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <Play className="h-8 w-8 mr-2" />
            Tap to Play
          </Button>
        </div>
      )}

      {/* Video Controls */}
      {isActive && hasUserInteracted && !showClickToPlay && (
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

          {/* Top right controls - Always show volume when user has interacted */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {/* Volume Slider */}
            {showVolumeSlider && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  min={0}
                  step={1}
                  className="w-20"
                />
                <span className="text-white text-xs min-w-[3ch]">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
            
            {/* Volume Button */}
            <Button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              size="sm"
              variant="ghost"
              className="bg-black/30 hover:bg-black/50 text-white border-0"
            >
              {React.createElement(getVolumeIcon(), { className: "h-4 w-4" })}
            </Button>
          </div>
        </div>
      )}

      {/* Volume Slider Overlay for Mobile */}
      {showVolumeSlider && (
        <div 
          className="absolute top-16 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 z-30"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-white text-xs">{Math.round(volume * 100)}%</span>
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              min={0}
              step={1}
              orientation="vertical"
              className="h-20 w-4"
            />
            <div className="text-white text-xs">
              {React.createElement(getVolumeIcon(), { className: "h-3 w-3" })}
            </div>
          </div>
        </div>
      )}

      {/* Hover to show controls */}
      {isActive && hasUserInteracted && !showClickToPlay && !showControls && (
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
        preload="auto"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onClick={showClickToPlay ? handleUserPlay : undefined}
      />
    </div>
  );
};