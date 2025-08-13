import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  url: string;
  className?: string;
  isMessage?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className, isMessage = false }) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setError('');
      
      console.log('VideoPlayer: Loading URL:', url);
      
      // Check if it's a Supabase storage URL that needs signed access
      if (url.includes('supabase.co/storage')) {
        console.log('VideoPlayer: Processing Supabase URL:', url);
        
        // For public URLs like: https://domain.supabase.co/storage/v1/object/public/bucket/path
        let bucketName = '';
        let filePath = '';
        
        if (url.includes('/object/public/')) {
          const parts = url.split('/object/public/');
          if (parts.length > 1) {
            const pathParts = parts[1].split('/');
            bucketName = pathParts[0];
            filePath = pathParts.slice(1).join('/');
          }
        } else if (url.includes('/storage/v1/object/')) {
          // Handle other storage URL formats
          const parts = url.split('/storage/v1/object/');
          if (parts.length > 1) {
            const pathParts = parts[1].split('/');
            if (pathParts[0] === 'public') {
              bucketName = pathParts[1];
              filePath = pathParts.slice(2).join('/');
            }
          }
        }
        
        console.log('VideoPlayer: Extracted bucket:', bucketName, 'path:', filePath);
        
        if (bucketName && filePath) {
          // Try to generate signed URL for private access
          try {
            const { data: signedData, error: signedError } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(filePath, 3600); // 1 hour validity
            
            if (signedError) {
              console.warn('VideoPlayer: Signed URL failed, using public URL:', signedError);
              setVideoSrc(url); // Fallback to direct URL
            } else {
              console.log('VideoPlayer: Using signed URL');
              setVideoSrc(signedData.signedUrl);
            }
          } catch (err) {
            console.warn('VideoPlayer: Signed URL generation failed:', err);
            setVideoSrc(url); // Fallback to direct URL
          }
        } else {
          console.log('VideoPlayer: Could not parse URL, using direct URL');
          setVideoSrc(url);
        }
      } else {
        console.log('VideoPlayer: Using direct URL (not Supabase)');
        setVideoSrc(url);
      }
      
      setLoading(false);
    };

    loadVideo();
  }, [url]);

  // Generate thumbnail when video metadata is loaded
  const generateThumbnail = (video: HTMLVideoElement) => {
    try {
      video.currentTime = 1; // Seek to 1 second
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL('image/png');
          setThumbnail(thumbnailDataUrl);
          console.log('VideoPlayer: Generated thumbnail');
        }
      };
    } catch (err) {
      console.error('VideoPlayer: Thumbnail generation failed:', err);
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    const video = e.currentTarget;
    
    if (video.paused) {
      // Unmute on user interaction for better experience
      video.muted = false;
      video.play().then(() => {
        console.log('VideoPlayer: Playing video');
      }).catch(err => {
        console.error('VideoPlayer: Play failed:', err);
        // Fallback to muted playback
        video.muted = true;
        video.play().catch(mutedErr => {
          console.error('VideoPlayer: Muted play also failed:', mutedErr);
        });
      });
    } else {
      video.pause();
    }
  };

  if (loading) {
    return (
      <div className={`${className} bg-gray-900 flex items-center justify-center rounded-lg`}>
        <div className="text-white text-sm">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-900 flex items-center justify-center rounded-lg`}>
        <div className="text-white text-sm">Video unavailable</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        src={videoSrc}
        poster={thumbnail || undefined}
        className={className}
        controls
        preload="metadata"
        playsInline
        muted
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => {
          console.log('VideoPlayer: Metadata loaded for:', url);
          generateThumbnail(e.currentTarget);
        }}
        onLoadedData={() => {
          console.log('VideoPlayer: Data loaded for:', url);
        }}
        onCanPlay={() => {
          console.log('VideoPlayer: Can play:', url);
        }}
        onError={(e) => {
          const video = e.currentTarget;
          console.error('VideoPlayer: Error:', {
            url,
            videoSrc,
            error: video.error?.message || 'Unknown error',
            code: video.error?.code || 'No code',
            networkState: video.networkState,
            readyState: video.readyState
          });
          setError('Video playback error');
        }}
        onClick={handleVideoClick}
        style={{ 
          display: 'block',
          backgroundColor: 'rgba(0,0,0,0.1)' 
        }}
      />
      
      {/* Play button overlay for better UX */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-0 h-0 border-l-8 border-r-0 border-t-6 border-b-6 border-transparent border-l-white ml-1" />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;