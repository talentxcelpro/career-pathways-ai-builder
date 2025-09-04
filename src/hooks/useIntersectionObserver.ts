import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverProps {
  element: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  root?: Element | null;
}

export const useIntersectionObserver = ({
  element,
  rootMargin = '0px',
  threshold = 0,
  freezeOnceVisible = false,
  root = null
}: UseIntersectionObserverProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!element) return;

    // If we've already intersected and freeze is enabled, don't observe
    if (freezeOnceVisible && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, rootMargin, threshold, freezeOnceVisible, hasIntersected, root]);

  return {
    isIntersecting,
    hasIntersected
  };
};

export const useIntersectionObserverRef = <T extends Element = Element>(
  options?: Omit<UseIntersectionObserverProps, 'element'>
) => {
  const [element, setElement] = useState<T | null>(null);
  const { isIntersecting, hasIntersected } = useIntersectionObserver({
    element,
    ...options
  });

  return {
    ref: setElement,
    isIntersecting,
    hasIntersected
  };
};