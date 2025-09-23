import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Handle play/pause with aggressive error handling
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      setError('Video element not found');
      return;
    }

    setHasUserInteracted(true);
    console.log('Toggle play clicked, current state:', { isPlaying, videoUrl });
    
    try {
      if (isPlaying) {
        video.pause();
        console.log('Video paused successfully');
      } else {
        // Ensure video is ready
        if (video.readyState < 2) {
          console.log('Video not ready, waiting...');
          await new Promise((resolve) => {
            const onCanPlay = () => {
              video.removeEventListener('canplay', onCanPlay);
              resolve(void 0);
            };
            video.addEventListener('canplay', onCanPlay);
          });
        }

        // Set muted first to avoid autoplay issues
        video.muted = isMuted;
        console.log('Attempting to play video, muted:', isMuted);
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        console.log('Video play successful');
        setError(null);
      }
    } catch (err: any) {
      console.error('Video play failed:', err);
      
      // Try fallback with muted autoplay
      if (!isPlaying && !isMuted) {
        try {
          console.log('Trying fallback muted play...');
          video.muted = true;
          setIsMuted(true);
          await video.play();
          setError(null);
          console.log('Fallback muted play successful');
        } catch (fallbackErr) {
          console.error('Fallback play also failed:', fallbackErr);
          setError(`Playback failed: ${err.message || 'Unknown error'}`);
        }
      } else {
        setError(`Playback failed: ${err.message || 'Unknown error'}`);
      }
    }
  }, [isPlaying, isMuted]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    console.log('Mute toggled:', newMuted);
  }, [isMuted]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Setting up video event handlers for:', videoUrl);

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration);
      setDuration(video.duration || 0);
    };

    const handleLoadedData = () => {
      console.log('Video data loaded');
      setIsLoading(false);
      setError(null);
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
      setError(null);
    };

    const handlePlay = () => {
      console.log('Video started playing');
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      console.log('Video paused');
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const errorCode = target.error?.code;
      const errorMessage = target.error?.message || 'Unknown error';
      
      console.error('Video error:', { errorCode, errorMessage, videoUrl });
      setIsLoading(false);
      setError(`Video error (${errorCode}): ${errorMessage}`);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleStalled = () => {
      console.warn('Video stalled');
    };

    const handleWaiting = () => {
      console.log('Video waiting for data');
    };

    // Add all event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, [videoUrl, onPlayStateChange]);

  // Auto-load video when URL changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    console.log('Loading new video:', videoUrl);
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    video.load();
  }, [videoUrl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Error state
  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", className)}>
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Video Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => {
              setError(null);
              setIsLoading(true);
              const video = videoRef.current;
              if (video) {
                video.load();
              }
            }}>
              Retry
            </Button>
            <p className="text-xs text-muted-foreground">
              URL: {videoUrl}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative bg-black rounded-lg overflow-hidden", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-lg">Loading video...</p>
            <p className="text-sm opacity-75 mt-2">{videoUrl}</p>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        muted={isMuted}
        crossOrigin="anonymous"
        onClick={togglePlay}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Controls overlay */}
      {(showControls || !isPlaying) && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              size="lg"
              variant="ghost"
              className="h-20 w-20 rounded-full bg-black/50 hover:bg-black/70 text-white border-2 border-white/30"
            >
              {isPlaying ? (
                <Pause className="h-10 w-10" />
              ) : (
                <Play className="h-10 w-10 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                {!hasUserInteracted && isMuted ? (
                  "Click to start (muted)"
                ) : hasUserInteracted && !isMuted ? (
                  "🔊 Sound ON"
                ) : (
                  "🔇 Sound OFF"
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white bg-black/50 p-2 rounded">
          <div>State: {isPlaying ? 'Playing' : 'Paused'}</div>
          <div>Muted: {isMuted ? 'Yes' : 'No'}</div>
          <div>Interacted: {hasUserInteracted ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};