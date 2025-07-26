import { useCallback, useEffect, useRef } from 'react';
import { usePageVisibility } from './useAutoRefresh';
import { useSmartCache } from './useSmartCache';

interface AutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  immediate?: boolean;
  pauseOnHidden?: boolean;
  adaptiveInterval?: boolean;
  maxInterval?: number;
  minInterval?: number;
}

export const useSmartAutoRefresh = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: AutoRefreshOptions = {}
) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    immediate = true,
    pauseOnHidden = true,
    adaptiveInterval = true,
    maxInterval = 300000, // 5 minutes
    minInterval = 10000 // 10 seconds
  } = options;

  const isVisible = usePageVisibility();
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIntervalRef = useRef(interval);
  const errorCountRef = useRef(0);
  const lastActivityRef = useRef(Date.now());

  const {
    data,
    isLoading,
    error,
    isValidating,
    revalidate,
    mutate,
    cache
  } = useSmartCache(key, fetcher, {
    ttl: interval * 2, // Cache for twice the refresh interval
    staleWhileRevalidate: true
  });

  // Adaptive interval based on user activity and errors
  const calculateAdaptiveInterval = useCallback(() => {
    if (!adaptiveInterval) return interval;

    const timeSinceActivity = Date.now() - lastActivityRef.current;
    const baseInterval = interval;
    
    // Increase interval if user inactive
    if (timeSinceActivity > 300000) { // 5 minutes inactive
      return Math.min(baseInterval * 2, maxInterval);
    }
    
    // Increase interval on errors (exponential backoff)
    if (errorCountRef.current > 0) {
      const backoffMultiplier = Math.pow(2, Math.min(errorCountRef.current, 4));
      return Math.min(baseInterval * backoffMultiplier, maxInterval);
    }
    
    return Math.max(baseInterval, minInterval);
  }, [interval, adaptiveInterval, maxInterval, minInterval]);

  const startRefreshTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!enabled) return;

    const adaptiveInterval = calculateAdaptiveInterval();
    currentIntervalRef.current = adaptiveInterval;

    intervalRef.current = setInterval(() => {
      if (!pauseOnHidden || isVisible) {
        revalidate();
      }
    }, adaptiveInterval);
  }, [enabled, calculateAdaptiveInterval, pauseOnHidden, isVisible, revalidate]);

  const stopRefreshTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    errorCountRef.current = 0; // Reset error count on user activity
    
    // Restart timer with fresh interval if adaptive
    if (adaptiveInterval) {
      startRefreshTimer();
    }
  }, [adaptiveInterval, startRefreshTimer]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  // Handle errors
  useEffect(() => {
    if (error) {
      errorCountRef.current += 1;
      startRefreshTimer(); // Restart with backoff
    } else {
      errorCountRef.current = 0;
    }
  }, [error, startRefreshTimer]);

  // Start/stop refresh timer based on visibility and enabled state
  useEffect(() => {
    if (enabled && (!pauseOnHidden || isVisible)) {
      startRefreshTimer();
    } else {
      stopRefreshTimer();
    }

    return stopRefreshTimer;
  }, [enabled, isVisible, pauseOnHidden, startRefreshTimer, stopRefreshTimer]);

  // Initial fetch
  useEffect(() => {
    if (immediate && !data && !isLoading) {
      revalidate();
    }
  }, [immediate, data, isLoading, revalidate]);

  return {
    data,
    isLoading,
    error,
    isValidating,
    revalidate,
    mutate,
    cache,
    refreshInfo: {
      currentInterval: currentIntervalRef.current,
      errorCount: errorCountRef.current,
      isActive: !!intervalRef.current,
      lastActivity: lastActivityRef.current
    }
  };
};