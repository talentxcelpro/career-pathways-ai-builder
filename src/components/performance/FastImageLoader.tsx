import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { ImageOptimizer } from '@/utils/imageOptimizer';

interface FastImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
  onLoad?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
}

export const FastImageLoader = memo<FastImageLoaderProps>(({
  src,
  alt,
  className,
  aspectRatio = '16/9',
  placeholder = '/placeholder.svg',
  onLoad,
  priority = false,
  width,
  height,
  quality = 85,
  sizes
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Generate optimized URLs
  const optimizedSrc = ImageOptimizer.getOptimizedUrl(src, { width, height, quality, format: 'webp' });
  const srcSet = width ? ImageOptimizer.generateSrcSet(src, [width * 0.5, width, width * 1.5, width * 2]) : undefined;
  const imageSizes = sizes || (width ? `${width}px` : ImageOptimizer.generateSizes());

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)} style={{ aspectRatio }}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
      )}
      
      {/* Main Image */}
      <img
        src={hasError ? placeholder : optimizedSrc}
        srcSet={hasError ? undefined : srcSet}
        sizes={hasError ? undefined : imageSizes}
        alt={alt}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
      />
    </div>
  );
});

FastImageLoader.displayName = 'FastImageLoader';