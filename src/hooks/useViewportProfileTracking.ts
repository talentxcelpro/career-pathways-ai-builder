import { useRef, useCallback, useEffect } from 'react';
import { useEnhancedProfileViews } from './useEnhancedProfileViews';

interface UseViewportProfileTrackingOptions {
  threshold?: number;
  rootMargin?: string;
  minViewTime?: number; // Minimum time in ms to consider a valid view
}

interface ViewportTrackingReturn {
  trackElementRef: (element: HTMLElement | null) => void;
  untrackElement: (element: HTMLElement) => void;
}

export const useViewportProfileTracking = (
  profileId: string,
  viewType: string = 'network_card',
  options: UseViewportProfileTrackingOptions = {}
): ViewportTrackingReturn => {
  const {
    threshold = 0.6, // 60% of element must be visible
    rootMargin = '0px',
    minViewTime = 2000 // 2 seconds minimum view time
  } = options;

  const { trackProfileView } = useEnhancedProfileViews();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewTimersRef = useRef<Map<Element, NodeJS.Timeout>>(new Map());
  const trackedElementsRef = useRef<Set<Element>>(new Set());

  // Initialize intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          
          if (entry.isIntersecting) {
            // Element came into view - start timer
            if (!viewTimersRef.current.has(element)) {
              const timer = setTimeout(() => {
                // Only track if element is still in view and hasn't been tracked
                if (entry.isIntersecting && !trackedElementsRef.current.has(element)) {
                  trackProfileView(profileId, viewType, {
                    intersectionRatio: entry.intersectionRatio,
                    elementHeight: entry.boundingClientRect.height,
                    viewportPosition: {
                      top: entry.boundingClientRect.top,
                      left: entry.boundingClientRect.left
                    }
                  }).then((tracked) => {
                    if (tracked) {
                      trackedElementsRef.current.add(element);
                    }
                  });
                }
                viewTimersRef.current.delete(element);
              }, minViewTime);
              
              viewTimersRef.current.set(element, timer);
            }
          } else {
            // Element left view - clear timer
            const timer = viewTimersRef.current.get(element);
            if (timer) {
              clearTimeout(timer);
              viewTimersRef.current.delete(element);
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    return () => {
      // Cleanup on unmount
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Clear all timers
      viewTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      viewTimersRef.current.clear();
      trackedElementsRef.current.clear();
    };
  }, [profileId, viewType, threshold, rootMargin, minViewTime, trackProfileView]);

  const trackElementRef = useCallback((element: HTMLElement | null) => {
    if (!observerRef.current) return;
    
    if (element) {
      observerRef.current.observe(element);
    }
  }, []);

  const untrackElement = useCallback((element: HTMLElement) => {
    if (!observerRef.current) return;
    
    observerRef.current.unobserve(element);
    
    // Clear any pending timer for this element
    const timer = viewTimersRef.current.get(element);
    if (timer) {
      clearTimeout(timer);
      viewTimersRef.current.delete(element);
    }
    
    // Remove from tracked elements
    trackedElementsRef.current.delete(element);
  }, []);

  return {
    trackElementRef,
    untrackElement
  };
};