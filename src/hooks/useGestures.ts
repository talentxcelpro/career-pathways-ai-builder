/**
 * Touch Gesture System with Haptic Feedback
 * Native-like mobile interactions
 */

import { useEffect, useCallback, useRef } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  enableHaptic?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

const DEFAULT_THRESHOLD = 50;
const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DELAY = 300;

export function useGestures(elementRef: React.RefObject<HTMLElement>, config: GestureConfig) {
  const startPoint = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistance = useRef<number | null>(null);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onLongPress,
    onDoubleTap,
    threshold = DEFAULT_THRESHOLD,
    enableHaptic = true,
  } = config;

  // Haptic feedback simulation (vibration API)
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic || !navigator.vibrate) return;

    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };

    navigator.vibrate(patterns[type]);
  }, [enableHaptic]);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    
    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Handle multi-touch for pinch
    if (e.touches.length === 2 && onPinch) {
      initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        hapticFeedback('heavy');
        onLongPress();
        startPoint.current = null;
      }, LONG_PRESS_DURATION);
    }
  }, [onLongPress, onPinch, getDistance, hapticFeedback]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on movement
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialPinchDistance.current) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance.current;
      onPinch(scale);
    }
  }, [onPinch, getDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!startPoint.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - startPoint.current.x;
    const dy = touch.clientY - startPoint.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - startPoint.current.timestamp;

    // Reset pinch
    initialPinchDistance.current = null;

    // Handle double tap
    const now = Date.now();
    if (duration < 200 && distance < 10) {
      if (now - lastTap.current < DOUBLE_TAP_DELAY && onDoubleTap) {
        hapticFeedback('medium');
        onDoubleTap();
        lastTap.current = 0;
        startPoint.current = null;
        return;
      }
      lastTap.current = now;
    }

    // Handle swipe gestures
    if (distance > threshold && duration < 500) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      if (Math.abs(angle) < 45 && onSwipeRight) {
        hapticFeedback('light');
        onSwipeRight();
      } else if (Math.abs(angle) > 135 && onSwipeLeft) {
        hapticFeedback('light');
        onSwipeLeft();
      } else if (angle < -45 && angle > -135 && onSwipeUp) {
        hapticFeedback('light');
        onSwipeUp();
      } else if (angle > 45 && angle < 135 && onSwipeDown) {
        hapticFeedback('light');
        onSwipeDown();
      }
    }

    startPoint.current = null;
  }, [
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    hapticFeedback,
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { hapticFeedback };
}

// Swipeable card component for mobile
export function useSwipeableCard(onSwipe: (direction: 'left' | 'right') => void) {
  const elementRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });

  useGestures(elementRef, {
    onSwipeLeft: () => onSwipe('left'),
    onSwipeRight: () => onSwipe('right'),
    threshold: 100,
  });

  return { elementRef };
}
