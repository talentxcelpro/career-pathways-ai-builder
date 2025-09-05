import React, { useRef, useEffect } from 'react';

interface SwipeableCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  children: React.ReactNode;
  className?: string;
  swipeThreshold?: number;
  doubleTapDelay?: number;
}

export const EnhancedSwipeableCard: React.FC<SwipeableCardProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  children,
  className = '',
  swipeThreshold = 100,
  doubleTapDelay = 300
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const lastTap = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;

    // Only start dragging if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isDragging.current = true;
      currentX.current = deltaX;

      // Apply transform with resistance
      const resistance = Math.abs(deltaX) > swipeThreshold ? 0.5 : 1;
      const transform = deltaX * resistance;
      
      cardRef.current.style.transform = `translateX(${transform}px)`;
      cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / (swipeThreshold * 3)}`;

      // Prevent scrolling when swiping
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!cardRef.current) return;

    const absX = Math.abs(currentX.current);

    if (isDragging.current && absX > swipeThreshold) {
      // Trigger swipe action
      if (currentX.current > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (currentX.current < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset card position
    cardRef.current.style.transform = 'translateX(0)';
    cardRef.current.style.opacity = '1';
    cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    // Reset transition after animation
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = '';
      }
    }, 300);

    isDragging.current = false;
    currentX.current = 0;
  };

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < doubleTapDelay && timeSinceLastTap > 0) {
      // Double tap detected
      if (onDoubleTap) {
        onDoubleTap();
      }
    }

    lastTap.current = now;
  };

  return (
    <div
      ref={cardRef}
      className={`touch-pan-y select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
      style={{
        willChange: 'transform, opacity',
        touchAction: 'pan-y'
      }}
    >
      {children}
    </div>
  );
};