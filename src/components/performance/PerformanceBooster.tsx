import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceBoosterProps {
  children: React.ReactNode;
}

// Performance monitoring and optimization
export const PerformanceBooster: React.FC<PerformanceBoosterProps> = ({ 
  children 
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimize images on route change
    const optimizeImages = () => {
      // Convert images to WebP if supported and lazy load
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Preload critical resources
    const preloadCritical = () => {
      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = '/fonts/segoe-ui.woff2';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Performance optimizations
    const startTime = performance.now();
    
    // Defer non-critical operations
    const timeoutId = setTimeout(() => {
      optimizeImages();
      preloadCritical();
      setIsLoading(false);
    }, 100);

    // Clean up
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  // Service worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed:', registrationError);
        });
    }
  }, []);

  return <>{children}</>;
};

// Fast image component with WebP support
export const FastImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, className = '', loading = 'lazy' }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if WebP is supported
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const isWebPSupported = checkWebPSupport();
    
    // Convert to WebP URL if supported and it's a Supabase image
    if (isWebPSupported && src.includes('supabase.co')) {
      const webpSrc = src.includes('?') 
        ? `${src}&format=webp&quality=85` 
        : `${src}?format=webp&quality=85`;
      setImageSrc(webpSrc);
    } else {
      setImageSrc(src);
    }
  }, [src]);

  if (!imageSrc) {
    return (
      <div className={`bg-muted/20 animate-pulse ${className}`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-muted/40 to-transparent"></div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (!error && imageSrc !== src) {
          setImageSrc(src); // Fallback to original
          setError(true);
        }
      }}
    />
  );
};