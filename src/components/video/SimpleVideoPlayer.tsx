import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleVideoPlayerProps {
  videoUrl: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  videoUrl,
  onPlayStateChange,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow autoplay
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    
    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        // Try to play - start muted if not interacted
        if (!hasUserInteracted) {
          video.muted = true;
          setIsMuted(true);
        }
        
        await video.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
        setError(false);
      }
    } catch (err) {
      console.error('Play failed:', err);
      setError(true);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  }, [isPlaying, hasUserInteracted, onPlayStateChange]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Restart video
  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    if (!isPlaying) {
      togglePlay();
    }
  }, [isPlaying, togglePlay]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setError(true);
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onPlayStateChange]);

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", className)}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📹</div>
          <p className="text-lg font-semibold mb-2">Video unavailable</p>
          <p className="text-sm text-muted-foreground mb-4">
            Unable to load video content
          </p>
          <Button onClick={() => {
            setError(false);
            setIsLoading(true);
            const video = videoRef.current;
            if (video) {
              video.load();
            }
          }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative bg-black rounded-lg overflow-hidden group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        muted={isMuted}
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              onClick={togglePlay}
              size="lg"
              variant="ghost"
              className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2">
              <Button
                onClick={restart}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost" 
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-white text-sm">
              {!hasUserInteracted && isMuted && (
                <span>Click to enable sound</span>
              )}
              {hasUserInteracted && !isMuted && (
                <span>🔊 Sound enabled</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click to start message */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white bg-black/50 rounded-lg p-4">
            <Play className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Click to play</p>
            {!hasUserInteracted && (
              <p className="text-sm opacity-80">Video will start muted</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};