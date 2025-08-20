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

  const img = (
    <img
      src={!error ? (src as string) : fallbackSrc}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
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
