import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface SwipeableViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const SwipeableView: React.FC<SwipeableViewProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  threshold = 100,
  disabled = false
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { swipe, isPressed, handlers } = useMobileGestures(threshold, 0.3);

  React.useEffect(() => {
    if (disabled || !swipe.direction || swipe.distance < threshold) return;

    triggerHaptic('light');

    switch (swipe.direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [swipe, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, triggerHaptic, disabled]);

  return (
    <div
      className={cn(
        'transition-all duration-300 touch-manipulation select-none',
        isPressed && 'scale-[0.98]',
        disabled && 'pointer-events-none',
        className
      )}
      {...(!disabled ? handlers : {})}
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const { triggerHaptic } = useHapticFeedback();

  const handleRefresh = async () => {
    if (disabled || !onRefresh) return;

    setIsRefreshing(true);
    triggerHaptic('medium');

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const { swipe, handlers } = useMobileGestures(80, 0.2);

  React.useEffect(() => {
    if (swipe.direction === 'down' && swipe.distance > 80 && !isRefreshing) {
      handleRefresh();
    }
  }, [swipe]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center bg-gradient-brand-soft animate-fade-in"
          style={{ height: Math.min(pullDistance, 60) }}
        >
          <div className="text-sm text-muted-foreground animate-bounce">
            {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 h-12 flex justify-center items-center bg-gradient-brand-soft animate-fade-in">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        className={cn(
          'transition-transform duration-200',
          isRefreshing && 'translate-y-12'
        )}
        {...(!disabled ? handlers : {})}
      >
        {children}
      </div>
    </div>
  );
};