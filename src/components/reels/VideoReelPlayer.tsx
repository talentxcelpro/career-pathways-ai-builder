
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoReelPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  autoPlay?: boolean;
  className?: string;
}

export const VideoReelPlayer: React.FC<VideoReelPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  isActive,
  onVideoLoad,
  onTimeUpdate,
  autoPlay = true,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      onVideoLoad?.();
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onVideoLoad, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && autoPlay && !error) {
      video.play().catch(() => setError(true));
    } else {
      video.pause();
    }
  }, [isActive, autoPlay, error]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || error) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => setError(true));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  if (error) {
    return (
      <div className={cn(
        "relative w-full h-full bg-gray-900 flex items-center justify-center",
        className
      )}>
        <div className="text-white text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">Unable to load video</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full group", className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoUrl}
        poster={thumbnailUrl}
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
