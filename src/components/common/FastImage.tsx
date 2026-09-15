import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { getCustomStorageUrl, getOriginalStorageUrl } from '@/utils/storage';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallback?: string;
  thumbnail?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  showBlurPlaceholder?: boolean;
}

export const FastImage: React.FC<FastImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  fallback = '/placeholder.svg',
  thumbnail = false,
  quality = 85,
  width,
  height,
  blurDataUrl,
  showBlurPlaceholder = true
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [blurPlaceholder, setBlurPlaceholder] = useState('');
  const [disableSrcSet, setDisableSrcSet] = useState(false);
  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // Reset state on source change
    setError(false);
    setLoaded(false);
    setDisableSrcSet(false);

    // Convert to custom domain first, then optimize
    const customSrc = getCustomStorageUrl(src);
    
    // Get optimized URL based on props  
    const optimized = ImageOptimizer.getOptimizedUrl(customSrc, {
      width: thumbnail ? 400 : width, 
      height: thumbnail ? 400 : height, 
      quality: thumbnail ? 80 : quality,
      format: 'webp'
    });
    
    setOptimizedSrc(optimized);

    // Generate blur placeholder if not provided
    if (showBlurPlaceholder && !blurDataUrl) {
      generateBlurPlaceholder(src);
    } else if (blurDataUrl) {
      setBlurPlaceholder(blurDataUrl);
    }
  }, [src, thumbnail, quality, width, height, blurDataUrl, showBlurPlaceholder]);

  const generateBlurPlaceholder = async (imageUrl: string) => {
    try {
      // Create a tiny version for blur effect
      const sourceForBlur = getCustomStorageUrl(imageUrl);
      const tinyUrl = ImageOptimizer.getOptimizedUrl(sourceForBlur, {
        width: 32,
        height: 32,
        quality: 10,
        format: 'jpeg'
      });
      setBlurPlaceholder(tinyUrl);
    } catch (error) {
      console.warn('Failed to generate blur placeholder:', error);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    console.warn('FastImage: Failed to load:', optimizedSrc);
    
    // If current URL is proxied/custom, fall back to original Supabase URL and disable srcSet
    const originalUrl = getOriginalStorageUrl(optimizedSrc);
    if (originalUrl && originalUrl !== optimizedSrc) {
      console.log('Retrying image load with original Supabase URL');
      setDisableSrcSet(true);
      setOptimizedSrc(originalUrl);
      setLoaded(false);
      return;
    }
    
    setError(true);
    setLoaded(true);
  };

  if (!optimizedSrc) {
    return (
      <div className={cn("relative overflow-hidden bg-muted/10", className)}>
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder (Instagram/LinkedIn style) */}
      {!loaded && blurPlaceholder && showBlurPlaceholder && (
        <img
          src={blurPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          style={{ 
            filter: 'blur(10px) brightness(0.9)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Loading shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/5 via-muted/10 to-muted/5 animate-pulse" />
      )}
      
      {/* Main optimized image with responsive srcSet */}
      <img
        src={error ? fallback : optimizedSrc}
        alt={alt}
        {...{ loading } as any}
        decoding="async"
        {...{ fetchpriority: loading === 'eager' ? 'high' : 'auto' } as any}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={cn(
          "w-full h-full object-cover object-center transition-all duration-500 ease-out",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          error && "opacity-50"
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Mobile-first responsive srcSet
        srcSet={!thumbnail && !error && !disableSrcSet ? `
          ${ImageOptimizer.getOptimizedUrl(getCustomStorageUrl(src), { width: 320, quality: 80, format: 'webp' })} 320w,
          ${ImageOptimizer.getOptimizedUrl(getCustomStorageUrl(src), { width: 640, quality: 85, format: 'webp' })} 640w,
          ${ImageOptimizer.getOptimizedUrl(getCustomStorageUrl(src), { width: 768, quality: 85, format: 'webp' })} 768w,
          ${ImageOptimizer.getOptimizedUrl(getCustomStorageUrl(src), { width: 1024, quality: 90, format: 'webp' })} 1024w,
          ${ImageOptimizer.getOptimizedUrl(getCustomStorageUrl(src), { width: 1280, quality: 90, format: 'webp' })} 1280w
        ` : undefined}
        sizes={!thumbnail ? `
          (max-width: 320px) 100vw,
          (max-width: 640px) 100vw,
          (max-width: 768px) 50vw,
          (max-width: 1024px) 33vw,
          25vw
        ` : '300px'}
      />
    </div>
  );
};