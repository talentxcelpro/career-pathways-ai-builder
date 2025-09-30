import React, { useState, useRef, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FastImage } from '@/components/common/FastImage';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { cn } from '@/lib/utils';
import { VideoThumbnail } from '@/components/media/VideoThumbnail';

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'youtube';
  id: string;
}

interface LazyMediaGridProps {
  mediaItems: MediaItem[];
  className?: string;
  gridClassName?: string;
  showThumbnails?: boolean;
}

export const LazyMediaGrid: React.FC<LazyMediaGridProps> = ({
  mediaItems,
  className,
  gridClassName,
  showThumbnails = true
}) => {
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());

  const [containerRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const handleItemLoad = useCallback((itemId: string) => {
    setLoadedItems(prev => new Set([...prev, itemId]));
  }, []);

  const getGridLayout = () => {
    const count = mediaItems.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (!isIntersecting) {
    return (
      <div 
        ref={containerRef}
        className={cn("grid gap-2", getGridLayout(), gridClassName, className)}
      >
        {mediaItems.slice(0, 4).map((_, index) => (
          <div
            key={index}
            className="w-full h-64 bg-muted/20 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("grid gap-2", getGridLayout(), gridClassName, className)}
    >
      {mediaItems.slice(0, 4).map((item, index) => {
        const itemClass = item.type === 'video'
          ? 'w-full aspect-video rounded-lg bg-black'
          : 'w-full h-64 object-cover object-center rounded-lg';

        return (
          <div key={item.id || index} className="relative">
            {item.type === 'youtube' ? (
              <VideoThumbnail 
                url={item.url}
                className="w-full h-64 rounded-lg"
                showTitle={false}
              />
            ) : item.type === 'video' ? (
              <VideoPlayer 
                url={item.url} 
                className={itemClass} 
                fit="contain" 
              />
            ) : (
              <FastImage
                src={item.url}
                alt={`Media ${index + 1}`}
                className={itemClass}
                loading="lazy"
                thumbnail={showThumbnails}
                quality={90}
              />
            )}
            
            {/* Show count overlay for additional items */}
            {index === 3 && mediaItems.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  +{mediaItems.length - 4}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};