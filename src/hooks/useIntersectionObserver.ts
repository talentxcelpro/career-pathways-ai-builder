import { useEffect, useRef, useState } from 'react';

// Overloaded hook - version 1: callback style  
export function useIntersectionObserver(
  target: React.RefObject<Element>,
  callback: () => void,
  options?: IntersectionObserverInit
): void;

// Overloaded hook - version 2: boolean style
export function useIntersectionObserver(
  target: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean;

// Implementation
export function useIntersectionObserver(
  target: React.RefObject<Element>,
  callbackOrOptions?: (() => void) | IntersectionObserverInit,
  optionsWhenCallback?: IntersectionObserverInit
): boolean | void {
  const observer = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const isCallbackStyle = typeof callbackOrOptions === 'function';
  const callback = isCallbackStyle ? callbackOrOptions : undefined;
  const options = isCallbackStyle ? optionsWhenCallback : callbackOrOptions;

  useEffect(() => {
    if (!target.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (callback) {
              callback();
            } else {
              setIsIntersecting(true);
            }
          } else if (!callback) {
            setIsIntersecting(false);
          }
        });
      },
      options || {}
    );

    observer.current.observe(target.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [target, callback, options]);

  // Return boolean for non-callback style
  if (!callback) {
    return isIntersecting;
  }
};