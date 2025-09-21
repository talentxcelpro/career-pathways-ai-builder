import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  element: Element | null;
  threshold?: number;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
  element,
  threshold = 0,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    // If we should freeze once visible and it has been visible, don't observe
    if (freezeOnceVisible && hasBeenVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, rootMargin, freezeOnceVisible, hasBeenVisible]);

  return { isIntersecting, hasBeenVisible };
};