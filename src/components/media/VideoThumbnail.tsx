import React, { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoThumbnailProps {
  url: string;
  className?: string;
  showTitle?: boolean;
  onClick?: () => void;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (
  videoId: string,
  quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'hq'
): string => {
  const suffixMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  } as const;
  const suffix = suffixMap[quality] || 'hqdefault';
  // Use i.ytimg.com (recommended) and a valid filename pattern
  return `https://i.ytimg.com/vi/${videoId}/${suffix}.jpg`;
};

// Helper function to extract video title from YouTube (simplified)
const getVideoTitle = async (url: string): Promise<string> => {
  try {
    // For YouTube, we'll use a simple title extraction
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube Video';
    }
    return 'Video';
  } catch {
    return 'Video';
  }
};

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  url,
  className = '',
  showTitle = true,
  onClick
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    const yt = getYouTubeVideoId(url) !== null;
    return !(yt && isMobile);
  });
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Check if it's a YouTube URL
        const youtubeId = getYouTubeVideoId(url);
        if (youtubeId) {
          const thumbnail = getYouTubeThumbnail(youtubeId, 'hq');
          setThumbnailUrl(thumbnail);
          if (showTitle) {
            const videoTitle = await getVideoTitle(url);
            setTitle(videoTitle);
          }
        } else {
          // For other video URLs, create a video element to get thumbnail
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.playsInline = true;
          video.preload = 'metadata';
          
          video.onloadedmetadata = () => {
            // Seek to 1 second or 10% of duration, whichever is smaller
            video.currentTime = Math.min(1, video.duration * 0.1);
          };
          
          video.onseeked = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 180;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setThumbnailUrl(thumbnailDataUrl);
              }
            } catch (error) {
              console.warn('Could not generate thumbnail:', error);
              setHasError(true);
            }
          };
          
          video.onerror = () => {
            setHasError(true);
          };
          
          video.src = url;
          
          // Cleanup
          setTimeout(() => {
            video.remove();
          }, 10000);
        }
      } catch (error) {
        console.warn('Error loading video thumbnail:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      loadThumbnail();
    }
  }, [url, showTitle]);

const buildYouTubeEmbedUrl = (videoId: string) => {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: '1',
    mute: '1',
    enablejsapi: '1',
    controls: '1',
    fs: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
    disablekb: '0'
  });
  if (typeof window !== 'undefined') {
    params.set('origin', window.location.origin);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const yt = getYouTubeVideoId(url) !== null;
    if (yt && isMobile) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    // Play inline otherwise
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className={cn(
        "relative rounded-lg overflow-hidden aspect-video flex items-center justify-center bg-muted",
        className
      )}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
      </div>
    );
  }

  if (hasError || !thumbnailUrl) {
    return (
      <div className={cn(
        "relative rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center cursor-pointer group bg-muted",
        className
      )} onClick={handleClick}>
        <Play className="h-12 w-12 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
        <p className="text-sm text-muted-foreground text-center px-4">
          Video Preview
        </p>
        <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
      </div>
    );
  }

  const isYoutube = getYouTubeVideoId(url) !== null;
  const youtubeId = getYouTubeVideoId(url);

  // Auto-play inline videos
  if (isPlaying) {
    if (youtubeId && !embedError) {
      return (
        <div className={cn(
          "relative rounded-lg overflow-hidden aspect-video mobile-video",
          className
        )}>
          <iframe
            src={buildYouTubeEmbedUrl(youtubeId)}
            className="w-full h-full"
            title="YouTube video player"
            allow="autoplay; encrypted-media; picture-in-picture; web-share; accelerometer; gyroscope"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ 
              border: 'none',
              width: '100%',
              height: '100%',
              minHeight: '200px'
            }}
            onError={() => {
              console.log('YouTube embed error, falling back');
              setEmbedError(true);
            }}
            onLoad={(e) => {
              const iframe = e.target as HTMLIFrameElement;
              // Add timeout to check if iframe is actually working
              const delay = isMobile ? 600 : 2000;
              setTimeout(() => {
                try {
                  if (iframe.contentDocument === null) {
                    // Iframe is blocked
                    setEmbedError(true);
                  }
                } catch (error) {
                  // Cross-origin error means iframe loaded but can't access content (normal)
                  // If we get a different error, it might be blocked
                  if (error.toString().includes('blocked')) {
                    setEmbedError(true);
                  }
                }
              }, delay);
            }}
          />
          {embedError && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white p-4 z-20">
              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 mb-3">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </div>
              <p className="text-sm mb-3 text-center">Video blocked by network</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in YouTube
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    // Fallback for YouTube when blocked or direct video files
    if (youtubeId && embedError) {
      return (
        <div className={cn(
          "relative rounded-lg overflow-hidden aspect-video bg-black flex flex-col items-center justify-center",
          className
        )}>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 z-10">
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 mb-3">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </div>
            <p className="text-sm mb-3 text-center">Video cannot be embedded</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
        </div>
      );
    }

    return (
      <video
        src={url}
        className={cn(
          "relative rounded-lg overflow-hidden aspect-video w-full h-full mobile-video",
          className
        )}
        controls
        autoPlay
        playsInline
        preload="metadata"
        muted
        style={{ maxHeight: '400px' }}
      />
    );
  }

  // Fallback to thumbnail view only if loading or not auto-playing
  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden aspect-video cursor-pointer group",
      className
    )} onClick={handleClick}>
      <img
        src={thumbnailUrl}
        alt={title || 'Video thumbnail'}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        onError={() => setHasError(true)}
      />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
        <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-all duration-200 group-hover:scale-110 shadow-lg">
          <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* YouTube badge */}
      {isYoutube && (
        <div className="absolute top-2 left-2">
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </div>
        </div>
      )}

      {/* External link indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ExternalLink className="h-4 w-4 text-white drop-shadow-md" />
      </div>

      {/* Title overlay */}
      {showTitle && title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-medium truncate">
            {title}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;