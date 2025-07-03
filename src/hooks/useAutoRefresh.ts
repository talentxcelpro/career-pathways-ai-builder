import { useEffect, useRef, useCallback, useState } from 'react';

export interface AutoRefreshOptions {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
}

/**
 * Global Auto-Refresh Hook
 * Manages automatic data refreshing with configurable intervals
 */
export function useAutoRefresh(
  callback: () => void | Promise<void>,
  options: AutoRefreshOptions
) {
  const { interval, enabled = true, immediate = false } = options;
  const callbackRef = useRef(callback);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  useEffect(() => {
    if (enabled) {
      if (immediate) {
        callbackRef.current();
      }
      start();
    } else {
      stop();
    }

    return stop;
  }, [enabled, start, stop, immediate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, restart };
}

/**
 * Module-specific refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  NETWORK: 10000,        // 10s - Network posts and connections
  JOBS: 20000,           // 20s - Job listings and applications
  COMPANIES: 30000,      // 30s - Company data
  LEARNING: 30000,       // 30s - Learning progress
  CAREER_MAP: 45000,     // 45s - Career roadmap updates
  EMPLOYER: 20000,       // 20s - Employer dashboard
  ADMIN: 30000,          // 30s - Admin panel data
  TOOLS: 60000,          // 60s - Tools and analytics
} as const;

/**
 * Hook for page visibility - pauses refresh when tab is not active
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Smart auto-refresh that pauses when page is hidden
 */
export function useSmartAutoRefresh(
  callback: () => void | Promise<void>,
  interval: number,
  options: { enabled?: boolean; immediate?: boolean } = {}
) {
  const isVisible = usePageVisibility();
  
  return useAutoRefresh(callback, {
    interval,
    enabled: (options.enabled ?? true) && isVisible,
    immediate: options.immediate
  });
}