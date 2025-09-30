import { useEffect, useRef, useState, RefObject } from 'react';

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

/**
 * Hook to detect when an element is visible in viewport
 * Useful for lazy loading images and content
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {},
  callback?: (isIntersecting: boolean) => void
): [RefObject<HTMLDivElement>, boolean] {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (callback) {
          callback(entry.isIntersecting);
        }
      },
      {
        threshold: options.threshold || 0.1,
        root: options.root || null,
        rootMargin: options.rootMargin || '50px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.root, options.rootMargin, callback]);

  return [elementRef, isVisible];
}

// Backward compatibility export
export const useIntersectionObserverCallback = useIntersectionObserver;

/**
 * Hook for lazy loading that only loads once
 */
export function useLazyLoad(options: IntersectionObserverOptions = {}) {
  const [ref, isVisible] = useIntersectionObserver(options);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isVisible, hasLoaded]);

  return [ref, hasLoaded] as const;
}
