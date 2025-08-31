import { useCallback, useRef, useState } from 'react';

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  doubleTapDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions = {}) => {
  const {
    threshold = 50,
    velocity = 0.3,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onDoubleTap,
    doubleTapDelay = 300
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const [isTracking, setIsTracking] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEnd.current = null;
    setIsTracking(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTracking) return;
    
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [isTracking]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || !isTracking) return;

    const endPoint = touchEnd.current || {
      x: touchStart.current.x,
      y: touchStart.current.y,
      time: Date.now()
    };

    const deltaX = endPoint.x - touchStart.current.x;
    const deltaY = endPoint.y - touchStart.current.y;
    const deltaTime = endPoint.time - touchStart.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for double tap
    const now = Date.now();
    if (distance < 10 && deltaTime < 200) {
      if (now - lastTap.current < doubleTapDelay) {
        onDoubleTap?.();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }

    // Check for swipe gestures
    if (distance > threshold) {
      const speed = distance / deltaTime;
      
      if (speed > velocity) {
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    }

    setIsTracking(false);
    touchStart.current = null;
    touchEnd.current = null;
  }, [isTracking, threshold, velocity, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onDoubleTap, doubleTapDelay]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isTracking
  };
};