import React, { useRef, useState } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface EnhancedSwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export const EnhancedSwipeableCard: React.FC<EnhancedSwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  className = '',
  swipeThreshold = 50
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    setCurrentX(e.touches[0].clientX);
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px)`;
      cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 200}`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    
    if (Math.abs(deltaX) > swipeThreshold) {
      triggerHaptic('medium');
      
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // Reset card position
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0)';
      cardRef.current.style.opacity = '1';
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      triggerHaptic('light');
      onDoubleTap?.();
    }
    
    setLastTap(now);
  };

  return (
    <div
      ref={cardRef}
      className={`touch-pan-y transition-transform duration-200 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleTap}
      style={{
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out'
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      {isDragging && Math.abs(currentX - startX) > 20 && (
        <>
          {currentX > startX && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-success opacity-70">
              <span className="text-2xl">👍</span>
            </div>
          )}
          {currentX < startX && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary opacity-70">
              <span className="text-2xl">🔖</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};