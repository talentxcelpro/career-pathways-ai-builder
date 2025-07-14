import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === null) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      const adjustedDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(adjustedDistance);
      setCanRefresh(adjustedDistance >= threshold);
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
    startY.current = null;
  }, [disabled, isRefreshing, canRefresh, pullDistance, threshold, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {shouldShowIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ 
              opacity: pullProgress,
              y: Math.max(-30, pullDistance - 50)
            }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : pullProgress * 180,
                  scale: Math.max(0.8, pullProgress)
                }}
                transition={{
                  rotate: isRefreshing 
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : { duration: 0 }
                }}
              >
                <RefreshCw 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    canRefresh ? "text-primary" : "text-muted-foreground"
                  )} 
                />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground">
                {isRefreshing 
                  ? "Refreshing..." 
                  : canRefresh 
                    ? "Release to refresh"
                    : "Pull to refresh"
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? 20 : pullDistance * 0.3
        }}
        transition={{ type: "tween", duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
};