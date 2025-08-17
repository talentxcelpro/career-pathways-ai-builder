import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface FastImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
  onLoad?: () => void;
  priority?: boolean;
}

export const FastImageLoader = memo<FastImageLoaderProps>(({
  src,
  alt,
  className,
  aspectRatio = '16/9',
  placeholder = '/placeholder.svg',
  onLoad,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        src={hasError ? placeholder : src}
        alt={alt}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
});

FastImageLoader.displayName = 'FastImageLoader';