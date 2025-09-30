import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface FastImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: 'blur' | 'shimmer' | 'skeleton' | 'none';
  onLoad?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  lazy?: boolean;
  threshold?: number;
  fadeInDuration?: number;
  blur?: boolean;
}

export const FastImageLoader = memo<FastImageLoaderProps>(({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  placeholder = 'shimmer',
  onLoad,
  priority = false,
  width,
  height,
  quality = 80,
  sizes = '100vw',
  lazy = true,
  threshold = 0.1,
  fadeInDuration = 300,
  blur = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);

  // Intersection observer for lazy loading
  const [imgRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);
  
  const generateOptimizedSrc = useCallback((originalSrc: string) => {
    // This would be replaced with your actual image optimization service
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (blur) params.append('blur', '5');
    
    return `${originalSrc}${originalSrc.includes('?') ? '&' : '?'}${params.toString()}`;
  }, [width, height, quality, blur]);

  const generateSrcSet = useCallback((originalSrc: string) => {
    const breakpoints = [320, 480, 768, 1024, 1280, 1536, 1920];
    return breakpoints
      .map(bp => `${generateOptimizedSrc(originalSrc)}&w=${bp} ${bp}w`)
      .join(', ');
  }, [generateOptimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const getPlaceholderContent = () => {
    switch (placeholder) {
      case 'blur':
        return <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm animate-pulse" />;
      case 'shimmer':
        return (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 animate-shimmer bg-[length:200%_100%]" />
        );
      case 'skeleton':
        return <div className="absolute inset-0 bg-muted animate-pulse rounded" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-md',
        className
      )}
      style={{ aspectRatio }}
    >
      {(!isLoaded || hasError) && placeholder !== 'none' && getPlaceholderContent()}
      
      <div ref={imgRef}>
        {shouldLoad && (
          <img
            src={generateOptimizedSrc(src)}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              hasError && 'hidden'
            )}
            style={{ 
              transitionDuration: `${fadeInDuration}ms`,
              filter: blur && !isLoaded ? 'blur(5px)' : 'none'
            }}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            width={width}
            height={height}
            decoding="async"
          />
        )}
      </div>
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 backdrop-blur-sm">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-xs text-destructive">!</span>
            </div>
            <span className="text-muted-foreground text-xs">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
});

FastImageLoader.displayName = 'FastImageLoader';