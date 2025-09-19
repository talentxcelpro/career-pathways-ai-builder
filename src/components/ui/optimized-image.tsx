import React, { useState, useRef, useEffect } from 'react';
import { createLazyLoader, optimizeImageUrl } from '@/utils/performance';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  sizes = "100vw",
  placeholder = 'empty',
  onLoad
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = createLazyLoader((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      });
    });

    if (observerRef.current && imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  // Generate responsive image sources
  const generateSrcSet = () => {
    if (!width) return undefined;
    
    const breakpoints = [480, 768, 1024, 1280, 1920];
    return breakpoints
      .filter(bp => bp <= width * 2) // Don't generate sizes larger than 2x the target
      .map(bp => `${optimizeImageUrl(src, bp, quality)} ${bp}w`)
      .join(', ');
  };

  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Skeleton */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? optimizeImageUrl(src, width, quality) : undefined}
        srcSet={isInView ? generateSrcSet() : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
    </div>
  );
};