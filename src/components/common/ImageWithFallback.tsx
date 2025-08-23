import React, { ImgHTMLAttributes, useState, useEffect } from 'react';
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
  const [imageSrc, setImageSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // Preload image to check if it's valid
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
      setError(false);
    };
    img.onerror = () => {
      console.warn('Image failed to load:', src);
      setImageSrc(fallbackSrc);
      setLoading(false);
      setError(true);
    };
    img.src = src;
  }, [src, fallbackSrc]);

  if (loading) {
    const loadingDiv = (
      <div className="absolute inset-0 w-full h-full bg-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      src={imageSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
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
