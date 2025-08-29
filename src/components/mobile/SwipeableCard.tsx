import React, { useState } from 'react';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  threshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  threshold = 100
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  
  const { swipe, handlers } = useMobileGestures(threshold, 0.3);

  React.useEffect(() => {
    if (swipe.direction && swipe.distance > threshold) {
      setIsAnimating(true);
      triggerHaptic('light');
      
      if (swipe.direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipe.direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
      
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [swipe, threshold, onSwipeLeft, onSwipeRight, triggerHaptic]);

  return (
    <div
      className={cn(
        "transition-transform duration-200",
        isAnimating && "scale-98",
        className
      )}
      {...handlers}
    >
      {children}
    </div>
  );
};