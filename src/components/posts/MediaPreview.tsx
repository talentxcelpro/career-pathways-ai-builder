import React, { useEffect, useState } from 'react';
import { getCustomStorageUrl } from '@/utils/storage';
import VideoPlayer from './VideoPlayer';
import { FastImage } from '@/components/common/FastImage';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { useUrlPreview } from '@/hooks/useUrlPreview';
import LinkPreview from '@/components/shared/LinkPreview';
import { X } from 'lucide-react';

interface MediaPreviewProps {
  content: string;
  mediaUrls?: string[];
  isMessage?: boolean; // For different styling in messages vs posts
}

interface MediaItemProps {
  mediaUrl: string;
  isVideo: boolean;
  className: string;
  index: number;
}

const MediaItem: React.FC<MediaItemProps> = ({ mediaUrl, isVideo, className, index }) => {
  if (!mediaUrl) {
    return (
      <div className={`${className} bg-muted/20 border border-muted/40 rounded-lg flex items-center justify-center`}>
        <p className="text-muted-foreground text-sm">Loading media...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isVideo ? (
        <VideoPlayer
          url={mediaUrl}
          className={className}
        />
      ) : (
        <FastImage
          src={mediaUrl}
          alt={`Media ${index + 1}`}
          className={className}
          loading="lazy"
          thumbnail={true}
          quality={90}
        />
      )}
    </div>
  );
};

export const MediaPreview: React.FC<MediaPreviewProps> = ({ 
  content, 
  mediaUrls = [], 
  isMessage = false 
}) => {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Use URL detection hook to find URLs in content
  const { detectedUrls } = useUrlDetection(content);
  
  // Convert storage URLs to custom domain and combine with URLs found in content
  const customMediaUrls = mediaUrls.map(url => getCustomStorageUrl(url));
  const allMediaUrls = [...customMediaUrls, ...detectedUrls.map(u => u.url)];
  
  // Separate URLs into media URLs and preview URLs
  const mediaItems = allMediaUrls.filter(url => {
    if (!url || url.includes('placeholder.com') || url.includes('example.com') || !url.startsWith('http')) {
      return false;
    }
    
    const lowercaseUrl = url.toLowerCase();
    const isYouTube = /(?:youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)/.test(lowercaseUrl);
    const isValidImage = ImageOptimizer.isValidImageUrl(url);
    const isValidVideo = ImageOptimizer.isValidVideoUrl(url);
    
    return isYouTube || isValidImage || isValidVideo;
  });

  // URLs that should show as link previews (not media)
  const linkPreviewUrls = detectedUrls.filter(detectedUrl => {
    const url = detectedUrl.url;
    const lowercaseUrl = url.toLowerCase();
    const isYouTube = /(?:youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)/.test(lowercaseUrl);
    const isValidImage = ImageOptimizer.isValidImageUrl(url);
    const isValidVideo = ImageOptimizer.isValidVideoUrl(url);
    
    // Show as link preview if it's not a direct media URL
    return !isYouTube && !isValidImage && !isValidVideo;
  });

  // Remove URLs from content that will be displayed as media or link previews
  const allDisplayedUrls = [...mediaItems, ...linkPreviewUrls.map(u => u.url)];
  const cleanContent = allDisplayedUrls.reduce((text, url) => {
    return text.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
  }, content);

  // Clean up extra whitespace and line breaks
  const finalContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/,\s*$/, ''); // Remove trailing comma

  if (mediaItems.length === 0 && linkPreviewUrls.length === 0) {
    return (
      <div>
        <p className={`${isMessage ? 'text-xs' : 'text-gray-900'} whitespace-pre-wrap`}>{content}</p>
      </div>
    );
  }

  return (
    <div>
      {finalContent && (
        <p className={`${isMessage ? 'text-xs' : 'text-gray-900'} whitespace-pre-wrap ${isMessage ? '' : 'mb-4'}`}>{finalContent}</p>
      )}
      
      {/* Media Grid */}
      {mediaItems.length > 0 && (
        <div className={`grid gap-2 ${isMessage ? 'mt-1' : 'mt-4'}`} style={{
          gridTemplateColumns: mediaItems.length === 1 ? '1fr' : 
                             mediaItems.length === 2 ? '1fr 1fr' :
                             mediaItems.length === 3 ? '1fr 1fr 1fr' :
                             '1fr 1fr'
        }}>
          {mediaItems.slice(0, 4).map((url: string, index: number) => {
          const isVideo = ImageOptimizer.isValidVideoUrl(url);
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
            : `w-full ${isMessage ? 'h-32' : 'aspect-square'} object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity`;

          
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
                />
              ) : (
                isVideo ? (
                  <VideoPlayer url={url} className={itemClass} fit="cover" />
                ) : (
                  <div 
                    className={itemClass}
                    onClick={() => setPreviewModalUrl(url)}
                  >
                    <FastImage
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      quality={95}
                    />
                  </div>
                )
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
      )}
      
      {/* Link Previews */}
      {linkPreviewUrls.length > 0 && (
        <div className={`space-y-3 ${isMessage ? 'mt-1' : 'mt-4'}`}>
          {linkPreviewUrls.slice(0, 3).map((detectedUrl, index) => (
            <LinkPreview
              key={index}
              url={detectedUrl.url}
              className={isMessage ? 'text-xs' : ''}
              compact={isMessage}
            />
          ))}
          {linkPreviewUrls.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{linkPreviewUrls.length - 3} more links
            </div>
          )}
        </div>
      )}

      {/* In-App Media Lightbox Modal (Keeps user on talentxcel.in) */}
      {previewModalUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2 shadow-2xl border border-slate-700" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-md"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={previewModalUrl} 
              alt="Full preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl mx-auto" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;