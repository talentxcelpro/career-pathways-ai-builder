import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        // Handle autoplay restrictions
        video.muted = true;
        video.play().catch(() => setError(true));
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={muted}
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
      />
    </div>
  );
};