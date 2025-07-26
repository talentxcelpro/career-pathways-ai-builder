import { useState, useEffect } from 'react';
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
  onError?: () => void;
}

// 🔴 Fix #2: Prevent layout shift with proper dimensions
// 🔴 Fix #4: WebP optimization and proper sizing
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes = '100vw',
  placeholder = 'empty',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  // Check WebP support and optimize
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    };

    if (checkWebPSupport() && !src.endsWith('.webp')) {
      // Convert to WebP if supported and not already WebP
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      setOptimizedSrc(webpSrc);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    // Fallback to original format if WebP fails
    if (optimizedSrc !== src) {
      setOptimizedSrc(src);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  // 🔴 Fix #3: Preload critical images
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      if (sizes && sizes !== '100vw') {
        link.setAttribute('imagesizes', sizes);
      }
      document.head.appendChild(link);
    }
  }, [optimizedSrc, priority, sizes]);

  // 🔴 Fix #2: Calculate aspect ratio to prevent CLS
  const aspectRatio = width && height ? width / height : undefined;
  const style = aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined;

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        !isLoaded && placeholder === 'blur' && "animate-pulse bg-muted",
        className
      )}
      style={style}
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-50"
        )}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};