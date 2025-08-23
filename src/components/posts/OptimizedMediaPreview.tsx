import React, { useEffect, useState, lazy, Suspense } from 'react';
import { FastImage } from '@/components/performance/PerformanceBooster';

// Lazy load video player for better performance
const VideoPlayer = lazy(() => import('./VideoPlayer'));

interface OptimizedMediaPreviewProps {
  content: string;
  mediaUrls?: string[];
  isMessage?: boolean;
}

interface MediaItemProps {
  mediaUrl: string;
  isVideo: boolean;
  className: string;
  index: number;
}

const MediaItem: React.FC<MediaItemProps> = ({ mediaUrl, isVideo, className, index }) => {
  const [fixedUrl, setFixedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaUrl) return;
    setFixedUrl(mediaUrl);
  }, [mediaUrl]);

  if (!fixedUrl) {
    return (
      <div className={`${className} bg-muted/20 border border-muted/40 rounded-lg flex items-center justify-center`}>
        <div className="animate-pulse bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 h-full w-full rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isVideo ? (
        <Suspense fallback={
          <div className={`${className} bg-black/10 flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <VideoPlayer
            url={fixedUrl}
            className={className}
          />
        </Suspense>
      ) : (
        <FastImage
          src={fixedUrl}
          alt={`Media ${index + 1}`}
          className={className}
          loading={index < 2 ? 'eager' : 'lazy'} // Load first 2 images eagerly
        />
      )}
    </div>
  );
};

const OptimizedMediaPreview: React.FC<OptimizedMediaPreviewProps> = ({ 
  content, 
  mediaUrls = [], 
  isMessage = false 
}) => {
  // Extract URLs from content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlsInContent = content.match(urlRegex) || [];
  
  // Combine media URLs with URLs found in content
  const allMediaUrls = [...mediaUrls, ...urlsInContent];
  
  // Filter for image and video URLs (including YouTube URLs and Supabase storage)
  const mediaItems = allMediaUrls.filter(url => {
    const lowercaseUrl = url.toLowerCase();
    const isSupabaseStorage = lowercaseUrl.includes('supabase.co/storage');
    const isDirectMedia = lowercaseUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg)(\?|$)/);
    const isPostMedia = lowercaseUrl.includes('/post-media/');
    const isMediaFolder = lowercaseUrl.includes('/media/');
    const isYouTube = lowercaseUrl.includes('youtube.com/watch') || lowercaseUrl.includes('youtu.be/');
    
    return isSupabaseStorage || isDirectMedia || isPostMedia || isMediaFolder || isYouTube;
  });

  // Remove URLs from content that will be displayed as media
  const cleanContent = mediaItems.reduce((text, url) => {
    return text.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
  }, content);

  // Clean up extra whitespace and line breaks
  const finalContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/,\s*$/, '');

  if (mediaItems.length === 0) {
    return (
      <div>
        <p className={`${isMessage ? 'text-xs' : 'text-gray-900'} whitespace-pre-wrap`}>{content}</p>
      </div>
    );
  }

  return (
    <div>
      {finalContent && (
        <p className={`${isMessage ? 'text-xs' : 'text-gray-900'} whitespace-pre-wrap ${isMessage ? '' : 'mb-4'}`}>
          {finalContent}
        </p>
      )}
      
      <div className={`grid gap-2 ${isMessage ? 'mt-1' : 'mt-4'}`} style={{
        gridTemplateColumns: mediaItems.length === 1 ? '1fr' : 
                           mediaItems.length === 2 ? '1fr 1fr' :
                           mediaItems.length === 3 ? '1fr 1fr 1fr' :
                           '1fr 1fr'
      }}>
        {mediaItems.slice(0, 4).map((url: string, index: number) => {
          const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(url) ||
                          (url.includes('supabase.co/storage') && /\.(mp4|webm|ogg)(\?|#|$)/i.test(url));
          const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be/');
          
          // Extract YouTube video ID for embedding
          const getYouTubeEmbedUrl = (url: string) => {
            let videoId = '';
            if (url.includes('youtube.com/watch')) {
              videoId = new URL(url).searchParams.get('v') || '';
            } else if (url.includes('youtu.be/')) {
              videoId = url.split('youtu.be/')[1].split('?')[0];
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
          };
          
          const itemClass = isVideo
            ? `w-full aspect-video rounded-lg bg-black`
            : `w-full ${isMessage ? 'h-32' : 'h-64'} object-cover object-center rounded-lg`;

          return (
            <div key={index} className="relative">
              {isYouTube ? (
                <iframe
                  src={getYouTubeEmbedUrl(url)}
                  className={`w-full ${isMessage ? 'h-32' : 'h-64'} rounded-lg`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`YouTube Video ${index + 1}`}
                  loading={index < 2 ? undefined : 'lazy'}
                />
              ) : (
                <MediaItem
                  mediaUrl={url}
                  isVideo={isVideo}
                  className={itemClass}
                  index={index}
                />
              )}
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
    </div>
  );
};

export default OptimizedMediaPreview;