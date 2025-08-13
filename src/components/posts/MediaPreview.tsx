import React from 'react';

interface MediaPreviewProps {
  content: string;
  mediaUrls?: string[];
  isMessage?: boolean; // For different styling in messages vs posts
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ content, mediaUrls = [], isMessage = false }) => {
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
    
    const isValidMedia = isSupabaseStorage || isDirectMedia || isPostMedia || isMediaFolder || isYouTube;
    
    if (isValidMedia) {
      console.log('MediaPreview: Found valid media URL:', url);
    }
    
    return isValidMedia;
  });

  // Remove URLs from content that will be displayed as media
  const cleanContent = mediaItems.reduce((text, url) => {
    return text.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
  }, content);

  // Clean up extra whitespace and line breaks
  const finalContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/,\s*$/, ''); // Remove trailing comma

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
        <p className={`${isMessage ? 'text-xs' : 'text-gray-900'} whitespace-pre-wrap ${isMessage ? '' : 'mb-4'}`}>{finalContent}</p>
      )}
      
      <div className={`grid gap-2 ${isMessage ? 'mt-1' : 'mt-4'}`} style={{
        gridTemplateColumns: mediaItems.length === 1 ? '1fr' : 
                           mediaItems.length === 2 ? '1fr 1fr' :
                           mediaItems.length === 3 ? '1fr 1fr 1fr' :
                           '1fr 1fr'
      }}>
        {mediaItems.slice(0, 4).map((url: string, index: number) => {
          const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
                          (url.includes('supabase.co/storage') && url.includes('.mp4'));
          const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be/');
          
          console.log('MediaPreview: Rendering media item:', { url, isVideo, isYouTube });
          
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
              ) : isVideo ? (
                <video 
                  src={url}
                  className={`w-full ${isMessage ? 'h-32' : 'h-64'} object-cover rounded-lg`}
                  controls
                  preload="metadata"
                  crossOrigin="anonymous"
                  onLoadStart={() => {
                    console.log('MediaPreview: Video load started:', url);
                  }}
                  onLoadedData={() => {
                    console.log('MediaPreview: Video loaded successfully:', url);
                  }}
                  onError={(e) => {
                    console.error('MediaPreview: Video failed to load:', {
                      url,
                      error: e.currentTarget.error,
                      networkState: e.currentTarget.networkState,
                      readyState: e.currentTarget.readyState
                    });
                    // Don't hide the video on error, show a fallback
                    e.currentTarget.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNVYxOUwxOSAxMkw4IDVaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=';
                  }}
                  style={{ 
                    display: 'block',
                    backgroundColor: 'rgba(0,0,0,0.1)' 
                  }}
                />
              ) : (
                <img 
                  src={url}
                  alt={`Media ${index + 1}`}
                  className={`w-full ${isMessage ? 'h-32' : 'h-64'} object-cover rounded-lg`}
                  onLoad={() => {
                    console.log('MediaPreview: Image loaded successfully:', url);
                  }}
                  onError={(e) => {
                    console.error('MediaPreview: Image failed to load:', url);
                    e.currentTarget.style.display = 'none';
                  }}
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

export default MediaPreview;