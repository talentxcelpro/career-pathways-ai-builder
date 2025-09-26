import { useState, useCallback, useRef, useEffect } from 'react';

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

export const useMobileGestures = (
  threshold: number = 50,
  velocityThreshold: number = 0.3
) => {
  const [swipe, setSwipe] = useState<SwipeGesture>({ direction: null, distance: 0, velocity: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const startPos = useRef<TouchPosition | null>(null);
  const currentPos = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent | React.TouchEvent) => {
    console.log('👆 TOUCH START detected');
    const touch = 'touches' in event ? event.touches[0] : event;
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
    currentPos.current = startPos.current;
    setIsPressed(true);
    setSwipe({ direction: null, distance: 0, velocity: 0 });
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent | React.TouchEvent) => {
    if (!startPos.current) return;
    
    const touch = 'touches' in event ? event.touches[0] : event;
    currentPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!startPos.current || !currentPos.current) {
      setIsPressed(false);
      return;
    }

    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    const deltaTime = currentPos.current.timestamp - startPos.current.timestamp;
    
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const velocity = distance / deltaTime;

    let direction: SwipeGesture['direction'] = null;

    if (distance > threshold && velocity > velocityThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      console.log('✅ SWIPE DETECTED:', direction, 'Distance:', distance, 'Velocity:', velocity);
    } else {
      console.log('❌ SWIPE NOT DETECTED - Distance:', distance, 'Velocity:', velocity, 'Threshold:', threshold);
    }

    setSwipe({ direction, distance, velocity });
    setIsPressed(false);
    startPos.current = null;
    currentPos.current = null;
  }, [threshold, velocityThreshold]);

  const resetSwipe = useCallback(() => {
    setSwipe({ direction: null, distance: 0, velocity: 0 });
  }, []);

  return {
    swipe,
    isPressed,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetSwipe
  };
};