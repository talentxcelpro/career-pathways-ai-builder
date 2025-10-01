import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestures } from '@/hooks/useGestures';
import { useGPUAnimation } from '@/hooks/useGPUAnimation';
import { useReducedMotion } from '@/hooks/useBatteryOptimization';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  enableHaptic?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  enableHaptic = true,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGestures(cardRef, {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enableHaptic,
    threshold: 50,
  });

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'touch-none select-none',
        'will-change-transform',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut',
      }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  size?: 'default' | 'large';
}

export function TouchTarget({
  children,
  onClick,
  onLongPress,
  className,
  size = 'default',
}: TouchTargetProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { pulse } = useGPUAnimation(targetRef);

  useGestures(targetRef, {
    onLongPress: () => {
      pulse();
      onLongPress?.();
    },
  });

  const sizeClass = size === 'large' ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]';

  return (
    <div
      ref={targetRef}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center',
        'cursor-pointer touch-target',
        'transition-transform active:scale-95',
        sizeClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function BottomSheet({ children, isOpen, onClose, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGestures(sheetRef, {
    onSwipeDown: onClose,
    threshold: 100,
  });

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      />
      <motion.div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background rounded-t-3xl',
          'max-h-[90vh] overflow-y-auto',
          'shadow-2xl',
          className
        )}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{
          type: prefersReducedMotion ? 'tween' : 'spring',
          damping: 30,
          stiffness: 300,
        }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) {
            onClose();
          }
        }}
      >
        <div className="sticky top-0 bg-background pt-4 pb-2 flex justify-center">
          <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="px-6 pb-6">{children}</div>
      </motion.div>
    </>
  );
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({ children, onRefresh, threshold = 80 }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useGestures(containerRef, {
    onSwipeDown: async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
        setPullDistance(0);
      }
    },
  });

  return (
    <div ref={containerRef} className="relative">
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all"
          style={{ height: Math.min(pullDistance, threshold) }}
        >
          <div className={cn('transition-transform', isRefreshing && 'animate-spin')}>
            {isRefreshing ? '⟳' : '↓'}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
