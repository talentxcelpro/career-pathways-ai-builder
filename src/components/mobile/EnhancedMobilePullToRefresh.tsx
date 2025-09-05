import React, { useState, useRef, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    
    // Only allow pull-to-refresh when at the top of the page
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    // Apply elastic resistance
    const elasticDistance = Math.min(distance * 0.6, threshold * 1.5);
    setPullDistance(elasticDistance);

    // Provide haptic feedback at threshold
    if (elasticDistance >= threshold && pullDistance < threshold) {
      triggerHaptic('medium');
    }

    // Prevent default scrolling when pulling
    if (distance > 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
        triggerHaptic('error');
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Animate back to original position
      const startDistance = pullDistance;
      const duration = 200;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setPullDistance(startDistance * (1 - easeOut));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setPullDistance(0);
        }
      };
      
      requestAnimationFrame(animate);
    }
    
    setStartY(0);
  };

  const getRefreshIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  const getRefreshIndicatorRotation = () => {
    if (isRefreshing) return 'animate-spin';
    return `rotate-${Math.min(Math.floor((pullDistance / threshold) * 180), 180)}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto h-full ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {/* Refresh Indicator */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center justify-center text-primary transition-all duration-200"
        style={{
          opacity: getRefreshIndicatorOpacity(),
          transform: `translateX(-50%) translateY(${Math.max(0, pullDistance - 40)}px)`
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent transition-transform duration-200 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? '' : `rotate(${Math.min((pullDistance / threshold) * 180, 180)}deg)`
          }}
        />
        <div className="text-xs mt-1 font-medium">
          {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: isRefreshing ? '60px' : '0px' }}>
        {children}
      </div>
    </div>
  );
};