import { useState, useEffect } from 'react';

/**
 * useImageOptimizer
 * A hook for handling premium image loading states with blur-up effects
 * and performance tracking.
 */
export const useImageOptimizer = (src: string, placeholder?: string) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    if (!src) return;

    const startTime = performance.now();
    const img = new Image();
    
    img.src = src;
    
    img.onload = () => {
      setLoadTime(performance.now() - startTime);
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    src: currentSrc,
    isLoaded,
    error,
    loadTime,
    // Premium CSS classes for blur-up effect
    imgClasses: `transition-all duration-700 ease-out ${
      isLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-md scale-105 opacity-50'
    }`
  };
};
