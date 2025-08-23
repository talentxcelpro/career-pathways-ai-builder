import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { VideoErrorFallback } from '@/components/video/VideoErrorFallback';
import { validateVideoUrl } from '@/utils/videoValidation';
import { ImageOptimizer } from '@/utils/imageOptimization';

interface VideoPlayerProps {
  url: string;
  className?: string;
  isMessage?: boolean;
  fit?: 'cover' | 'contain';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '', isMessage = false, fit = 'cover' }) => {
  console.log('VideoPlayer: Initializing with URL:', url);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isValidating, setIsValidating] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processVideoUrl = async () => {
      setIsValidating(true);
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      console.log('VideoPlayer: Processing URL:', url);
      
      if (!url || url.trim() === '') {
        setHasError(true);
        setErrorMessage('No video URL provided');
        setIsValidating(false);
        setIsLoading(false);
        return;
      }

      // Skip validation for performance - trust the URL and handle errors in video element
      try {
        new URL(url); // Basic URL validation
      } catch {
        setHasError(true);
        setErrorMessage('Invalid video URL format');
        setIsValidating(false);
        setIsLoading(false);
        return;
      }
      
      // Check if it's a Supabase storage URL (any domain) for post-media bucket
      const isSupabaseObjectUrl = url.includes('/object/') && url.includes('/post-media/');
      if (isSupabaseObjectUrl) {
        try {
          // Extract the file path from the URL (everything after /post-media/)
          const marker = '/post-media/';
          const idx = url.indexOf(marker);
          if (idx !== -1) {
            const filePath = url.substring(idx + marker.length);
            console.log('VideoPlayer: Extracted file path:', filePath);
            
            // Get public URL for the file, and fallback to signed URL if needed
            const { data } = supabase.storage
              .from('post-media')
              .getPublicUrl(filePath);
            console.log('VideoPlayer: Generated public URL:', data.publicUrl);

            let finalUrl = data.publicUrl || url;
            
            // For public buckets, ALWAYS use signed URLs to bypass CDN cache issues
            // This ensures fresh content for new uploads
            try {
              const signed = await supabase.storage
                .from('post-media')
                .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
              if (signed.data?.signedUrl) {
                finalUrl = signed.data.signedUrl;
                console.log('VideoPlayer: Using fresh signed URL to bypass CDN cache');
              } else {
                // Fallback: aggressive cache-busting with both timestamp and random
                const cacheBust = `cb=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
                finalUrl = finalUrl + (finalUrl.includes('?') ? '&' : '?') + cacheBust;
                console.log('VideoPlayer: Using cache-busted public URL');
              }
            } catch (e) {
              console.warn('VideoPlayer: Signed URL generation failed, using aggressive cache-busting');
              // Aggressive cache-busting for public URLs
              const cacheBust = `cb=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
              finalUrl = finalUrl + (finalUrl.includes('?') ? '&' : '?') + cacheBust;
            }
            setVideoSrc(finalUrl);
          } else {
            console.log('VideoPlayer: Using original URL as-is');
            setVideoSrc(url);
          }
        } catch (error) {
          console.error('VideoPlayer: Error processing Supabase URL:', error);
          setVideoSrc(url); // Fallback to original URL
        }
      } else {
        console.log('VideoPlayer: Using URL directly');
        setVideoSrc(url);
      }
      
      setIsValidating(false);
    };

    processVideoUrl();
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const handleLoadedData = () => {
      console.log('VideoPlayer: Video loaded successfully:', videoSrc);
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (e: Event) => {
      console.error('VideoPlayer: Video error for URL:', videoSrc, e);
      if (video) {
        console.error('VideoPlayer: Video error details:', {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState,
          currentSrc: video.currentSrc
        });
      }
      setIsLoading(false);
      setHasError(true);
    };

    const handleLoadStart = () => {
      console.log('VideoPlayer: Starting to load:', videoSrc);
      setIsLoading(true);
      setHasError(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [videoSrc]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        await video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    // Re-process the URL
    const processUrl = async () => {
      setIsValidating(true);
      const isValid = await validateVideoUrl(url);
      if (isValid) {
        setVideoSrc(url);
      } else {
        setHasError(true);
        setErrorMessage('Video URL is not accessible');
      }
      setIsValidating(false);
    };
    processUrl();
  };

  if (hasError) {
    return (
      <VideoErrorFallback 
        error={errorMessage || 'Unable to load video'} 
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  if (isValidating) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className={`relative group rounded-lg overflow-hidden bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          muted={isMuted}
          playsInline
          preload="metadata"
          controls={false}
          crossOrigin="anonymous"
          webkit-playsinline="true"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={() => console.log('VideoPlayer: Can play:', videoSrc)}
          onLoadedMetadata={() => console.log('VideoPlayer: Metadata loaded:', videoSrc)}
          style={{ 
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="secondary"
            size="icon"
            className="h-16 w-16 rounded-full bg-black/70 hover:bg-black/80 border-2 border-white/20"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 text-white ml-1" fill="white" />
          </Button>
        </div>
      )}

      {/* Control bar */}
      {(showControls || isPlaying) && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="white" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" fill="white" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;