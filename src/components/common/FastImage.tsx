import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallback?: string;
}

export const FastImage: React.FC<FastImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  fallback = '/placeholder.svg'
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted/10 animate-pulse" />
      )}
      <img
        src={error ? fallback : src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.warn('Image failed to load:', src);
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
};