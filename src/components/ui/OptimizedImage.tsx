import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  sizes,
  className,
  fallback = '/placeholder-image.svg',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate optimized src and srcSet
  const getOptimizedSrc = (originalSrc: string, width?: number, quality = 75) => {
    // For external URLs or already optimized images, return as-is
    if (originalSrc.startsWith('http') || originalSrc.includes('supabase')) {
      return originalSrc;
    }
    
    // For local images, we could implement WebP conversion here
    // For now, return the original src
    return originalSrc;
  };

  const generateSrcSet = (src: string) => {
    if (!width) return undefined;
    
    const widths = [width * 0.5, width, width * 1.5, width * 2];
    return widths
      .map(w => `${getOptimizedSrc(src, w, quality)} ${w}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : getOptimizedSrc(src, width, quality);
  const srcSet = hasError ? undefined : generateSrcSet(src);

  return (
    <div 
      ref={imgRef} 
      className={cn(
        'relative overflow-hidden bg-muted',
        !isLoaded && 'animate-pulse',
        className
      )}
      style={{ width, height }}
    >
      {isInView && (
        <>
          {/* Blur placeholder */}
          {!isLoaded && !hasError && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-muted-foreground/10 to-muted-foreground/5 animate-pulse"
              aria-hidden="true"
            />
          )}
          
          <img
            src={imageSrc}
            srcSet={srcSet}
            sizes={sizes || (width ? `${width}px` : '100vw')}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              'w-full h-full object-cover'
            )}
            {...props}
          />
        </>
      )}
      
      {/* Loading state for non-priority images */}
      {!isInView && !priority && (
        <div 
          className="w-full h-full bg-muted flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};