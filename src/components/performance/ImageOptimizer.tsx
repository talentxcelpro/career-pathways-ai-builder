import React, { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageOptimizer = memo<ImageOptimizerProps>(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  format = 'auto',
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate optimized URL (in real app, this would use a service like Cloudinary)
  const getOptimizedUrl = useCallback((originalSrc: string) => {
    // For now, return original URL, but this could be enhanced with:
    // - WebP/AVIF conversion
    // - Automatic resizing
    // - Quality optimization
    // - CDN integration
    return originalSrc;
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted animate-pulse"
          style={{ 
            backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px'
          }}
        />
      )}

      {/* Main Image */}
      <img
        src={hasError ? '/placeholder.svg' : optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
        }}
      />
    </div>
  );
});

ImageOptimizer.displayName = 'ImageOptimizer';