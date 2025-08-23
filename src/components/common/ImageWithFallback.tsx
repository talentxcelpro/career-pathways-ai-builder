import React, { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspect?: string; // e.g., '16/9'
  unwrapped?: boolean; // when true, render img without wrapper (for use inside AspectRatio)
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  aspect,
  unwrapped = false,
  ...rest
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    console.warn('Image failed to load:', src);
    setLoading(false);
    setError(true);
  };

  if (loading) {
    const loadingDiv = (
      <div className="absolute inset-0 w-full h-full bg-muted/10 flex items-center justify-center">
        <div className="animate-pulse bg-muted/20 w-full h-full rounded"></div>
      </div>
    );
    if (aspect) {
      return (
        <div className={cn('relative overflow-hidden', `aspect-[${aspect}]`)}>
          {loadingDiv}
        </div>
      );
    }
    return unwrapped ? loadingDiv : <div className="relative overflow-hidden">{loadingDiv}</div>;
  }

  const img = (
    <img
      src={!error ? (src as string) : fallbackSrc}
      alt={alt}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
      className={cn(
        'absolute inset-0 w-full h-full object-cover',
        className
      )}
      {...rest}
    />
  );

  if (aspect) {
    return (
      <div className={cn('relative overflow-hidden', `aspect-[${aspect}]`)}>
        {img}
      </div>
    );
  }

  if (unwrapped) {
    return img;
  }

  return <div className="relative overflow-hidden">{img}</div>;
};
