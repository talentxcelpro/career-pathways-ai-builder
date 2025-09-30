import React, { useState } from 'react';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

/**
 * Lazy-loaded image component with loading state
 * Only loads when visible in viewport
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  skeletonClassName = '',
  ...props
}) => {
  const [ref, hasLoaded] = useLazyLoad({ threshold: 0.1, rootMargin: '100px' });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!imageLoaded && !error && (
        <Skeleton className={`absolute inset-0 ${skeletonClassName}`} />
      )}
      {hasLoaded && !error && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setError(true)}
          {...props}
        />
      )}
      {error && (
        <div className="flex items-center justify-center bg-muted text-muted-foreground p-4">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyImage);
