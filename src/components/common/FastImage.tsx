import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOptimizer } from '@/utils/imageOptimization';

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
  height
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // Get optimized URL based on props
    const optimized = thumbnail 
      ? ImageOptimizer.getThumbnailUrl(src)
      : ImageOptimizer.getOptimizedUrl(src, { 
          width, 
          height, 
          quality,
          format: 'webp',
          fit: 'cover' 
        });
    
    setOptimizedSrc(optimized);
  }, [src, thumbnail, quality, width, height]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    console.warn('FastImage: Failed to load:', optimizedSrc);
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
      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-muted/5 to-muted/10 animate-pulse" />
      )}
      
      {/* Optimized image with mobile-first attributes */}
      <img
        src={error ? fallback : optimizedSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          error && "opacity-50"
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Generate responsive srcSet for different screen sizes
        srcSet={!thumbnail && !error ? ImageOptimizer.generateSrcSet(src) : undefined}
        sizes={!thumbnail ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined}
      />
    </div>
  );
};