import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallback?: string;
}

export const FastImage: React.FC<FastImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  fallback = '/placeholder.svg'
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // iOS optimization - preload images
  React.useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    // Removed crossOrigin to avoid iOS CORS decode issues
    img.decoding = 'async';
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      console.warn('Image failed to preload:', src);
      // Try cache-busting once for stubborn iOS/CDN caches
      const busted = src.includes('cb=') ? src : `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now()}`;
      setCurrentSrc(busted);
      setError(true);
      setLoaded(false);
    };
    
    img.src = src;
  }, [src, fallback]);

  return (
    <div className={cn("relative overflow-hidden bg-muted/10", className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse rounded" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        draggable={false}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 ease-out",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        )}
        style={{
          imageRendering: '-webkit-optimize-contrast' // iOS optimization
        }}
        onLoad={() => {
          setLoaded(true);
          setError(false);
        }}
        onError={() => {
          console.warn('Image failed to load:', src);
          // One retry with cache-busting to avoid stale iOS/CDN caches
          if (currentSrc === src && !src.includes('cb=')) {
            const busted = `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now()}`;
            setCurrentSrc(busted);
            return;
          }
          if (currentSrc !== fallback) {
            setCurrentSrc(fallback);
            setError(true);
          }
        }}
      />
    </div>
  );
};