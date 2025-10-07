import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  src: string;
  alt: string; // Make alt required for SEO
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  className?: string;
}

/**
 * SEO-optimized image component with lazy loading, error handling, and required alt text
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    setImageError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError && fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageError(true);
    }
    onError?.(event);
  }, [imageError, fallbackSrc, imageSrc, onError]);

  // Validate alt text for SEO compliance
  const validatedAlt = alt.trim() || 'Image';
  
  if (validatedAlt.length < 3) {
    console.warn(`SEO Warning: Alt text too short for image ${src}. Consider providing more descriptive text.`);
  }

  return (
    <img
      src={imageSrc}
      alt={validatedAlt}
      {...{ loading: priority ? 'eager' : 'lazy' } as any}
      {...{ fetchPriority: priority ? 'high' : 'low' } as any}
      decoding="async"
      sizes={sizes}
      className={cn(
        'transition-opacity duration-300',
        {
          'opacity-0': !isLoaded && placeholder === 'blur',
          'opacity-100': isLoaded || placeholder === 'empty',
        },
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

/**
 * Company logo component with optimized defaults
 */
export const CompanyLogo: React.FC<{
  src?: string;
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, companyName, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const alt = `${companyName} company logo`;

  return (
    <OptimizedImage
      src={src || '/placeholder.svg'}
      alt={alt}
      className={cn(
        'rounded-lg object-contain bg-gray-100',
        sizeClasses[size],
        className
      )}
      sizes="(max-width: 768px) 32px, 48px"
    />
  );
};

/**
 * User avatar component with optimized defaults
 */
export const UserAvatar: React.FC<{
  src?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, userName, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const alt = `${userName} profile picture`;

  return (
    <OptimizedImage
      src={src || '/placeholder.svg'}
      alt={alt}
      className={cn(
        'rounded-full object-cover bg-gray-100',
        sizeClasses[size],
        className
      )}
      sizes="(max-width: 768px) 32px, 40px"
    />
  );
};

/**
 * Hero image component with high priority loading and performance optimizations
 */
export const HeroImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300 will-change-transform w-full h-auto",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: '800px 600px',
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-3xl" />
      )}
    </div>
  );
};