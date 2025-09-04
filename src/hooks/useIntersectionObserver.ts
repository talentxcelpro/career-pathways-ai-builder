import { useEffect, useRef, useState, RefObject } from 'react';

// Backward-compatible Intersection Observer hook
// Supports 3 signatures:
// 1) useIntersectionObserver(ref, options?) => boolean
// 2) useIntersectionObserver(ref, callback, options?) => boolean
// 3) useIntersectionObserver({ element, rootMargin?, threshold?, freezeOnceVisible?, root? }) => { isIntersecting, hasIntersected }

type ObserverOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
};

// Overloads
export function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: Omit<ObserverOptions, 'freezeOnceVisible'>
): boolean;

export function useIntersectionObserver(
  ref: RefObject<Element>,
  callback: () => void,
  options?: Omit<ObserverOptions, 'freezeOnceVisible'>
): boolean;

export function useIntersectionObserver(params: {
  element: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  root?: Element | null;
}): { isIntersecting: boolean; hasIntersected: boolean };

// Implementation
export function useIntersectionObserver(
  arg1: RefObject<Element> | { element: Element | null; rootMargin?: string; threshold?: number | number[]; freezeOnceVisible?: boolean; root?: Element | null },
  arg2?: (() => void) | Omit<ObserverOptions, 'freezeOnceVisible'>,
  arg3?: Omit<ObserverOptions, 'freezeOnceVisible'>
): boolean | { isIntersecting: boolean; hasIntersected: boolean } {
  // Object signature
  if (typeof arg1 === 'object' && 'element' in arg1) {
    const { element, root = null, rootMargin = '0px', threshold = 0, freezeOnceVisible = false } = arg1;
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    useEffect(() => {
      if (!element) return;
      if (freezeOnceVisible && hasIntersected) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          const isNowIntersecting = entry.isIntersecting;
          setIsIntersecting(isNowIntersecting);
          if (isNowIntersecting && !hasIntersected) setHasIntersected(true);
        },
        { root, rootMargin, threshold }
      );

      observer.observe(element);
      return () => observer.unobserve(element);
    }, [element, root, rootMargin, threshold, freezeOnceVisible, hasIntersected]);

    return { isIntersecting, hasIntersected };
  }

  // Ref signature(s)
  const ref = arg1 as RefObject<Element>;
  const callback = typeof arg2 === 'function' ? (arg2 as () => void) : undefined;
  const options = (callback ? arg3 : arg2) as Omit<ObserverOptions, 'freezeOnceVisible'> | undefined;
  const { root = null, rootMargin = '0px', threshold = 0 } = options || {};

  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsIntersecting(visible);

        if (visible && callback && !hasCalledRef.current) {
          hasCalledRef.current = true;
          try {
            callback();
          } finally {
            // allow future triggers if needed when element re-enters
            setTimeout(() => (hasCalledRef.current = false), 0);
          }
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [ref, callback, root, rootMargin, threshold]);

  return isIntersecting;
}

// Convenience ref hook (unchanged API)
export const useIntersectionObserverRef = <T extends Element = Element>(
  options?: Omit<ObserverOptions, 'freezeOnceVisible'>
) => {
  const [element, setElement] = useState<T | null>(null);
  const isIntersecting = useIntersectionObserver({ element, ...(options || {}) });

  return {
    ref: setElement,
    isIntersecting: typeof isIntersecting === 'boolean' ? isIntersecting : isIntersecting.isIntersecting,
    hasIntersected: typeof isIntersecting === 'boolean' ? !!isIntersecting : isIntersecting.hasIntersected,
  };
};