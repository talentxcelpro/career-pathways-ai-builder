import React, { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspect?: string; // e.g., '16/9'
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  aspect,
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
        'absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out',
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

  return <div className="relative overflow-hidden">{img}</div>;
};
