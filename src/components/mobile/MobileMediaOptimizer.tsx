import React from 'react';
import { FastImage } from '@/components/common/FastImage';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { cn } from '@/lib/utils';

interface MobileMediaOptimizerProps {
  mediaUrls?: string[];
  className?: string;
  priority?: boolean;
}

export const MobileMediaOptimizer: React.FC<MobileMediaOptimizerProps> = ({
  mediaUrls = [],
  className,
  priority = false
}) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || 
           url.includes('.webm') || url.includes('video');
  };

  const firstMedia = mediaUrls[0];
  const isFirstVideo = isVideo(firstMedia);

  return (
    <div className={cn("w-full rounded-2xl overflow-hidden bg-muted/5", className)}>
      {isFirstVideo ? (
        <VideoPlayer 
          url={firstMedia}
          className="w-full aspect-video"
          fit="cover"
        />
      ) : (
        <FastImage
          src={firstMedia}
          alt="Post media"
          className="w-full aspect-video"
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Show additional media count if more than 1 */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
          +{mediaUrls.length - 1} more
        </div>
      )}
    </div>
  );
};