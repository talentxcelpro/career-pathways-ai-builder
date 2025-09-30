import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AdvancedImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const AdvancedImageOptimizer: React.FC<AdvancedImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [containerRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Generate optimized image URLs
  const generateOptimizedSrc = useCallback((originalSrc: string, targetWidth?: number) => {
    // For external images or when width is not specified, return original
    if (!originalSrc.startsWith('/') || !targetWidth) {
      return originalSrc;
    }

    // Add optimization parameters (this would integrate with your image optimization service)
    const params = new URLSearchParams({
      q: quality.toString(),
      w: targetWidth.toString()
    });

    return `${originalSrc}?${params.toString()}`;
  }, [quality]);

  // Generate responsive image sources
  const generateSrcSet = useCallback(() => {
    if (!width) return undefined;

    const widths = [width, width * 1.5, width * 2, width * 3];
    return widths
      .map(w => `${generateOptimizedSrc(src, w)} ${w}w`)
      .join(', ');
  }, [src, width, generateOptimizedSrc]);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Load image when visible or if priority
  useEffect(() => {
    if (priority || isVisible) {
      setImageSrc(generateOptimizedSrc(src, width));
    }
  }, [priority, isVisible, src, width, generateOptimizedSrc]);

  // Preload high priority images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = generateOptimizedSrc(src, width);
      if (generateSrcSet()) {
        link.imageSrcset = generateSrcSet()!;
        link.imageSizes = sizes || '100vw';
      }
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, src, width, generateOptimizedSrc, generateSrcSet, sizes]);

  // Intersection Observer for lazy loading
  const shouldShowPlaceholder = !isLoaded && placeholder === 'blur';
  const placeholderSrc = blurDataURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Blur */}
      {shouldShowPlaceholder && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      {imageSrc && !hasError && (
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};