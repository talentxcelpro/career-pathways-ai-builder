import { useEffect, useCallback, useRef } from 'react';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const memoryWarningThreshold = 0.8; // 80% of heap limit

  const getMemoryStats = useCallback((): MemoryStats | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  const checkMemoryUsage = useCallback(() => {
    const stats = getMemoryStats();
    if (!stats) return;

    const memoryRatio = stats.usedJSHeapSize / stats.jsHeapSizeLimit;
    
    if (memoryRatio > memoryWarningThreshold) {
      console.warn('High memory usage detected:', {
        used: Math.round(stats.usedJSHeapSize / 1024 / 1024),
        total: Math.round(stats.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(stats.jsHeapSizeLimit / 1024 / 1024),
        ratio: Math.round(memoryRatio * 100)
      });

      // Trigger garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    }
  }, [getMemoryStats, memoryWarningThreshold]);

  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
    
    return () => {
      const index = cleanupFunctions.current.indexOf(cleanup);
      if (index > -1) {
        cleanupFunctions.current.splice(index, 1);
      }
    };
  }, []);

  const forceCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  // Periodic memory monitoring
  useEffect(() => {
    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceCleanup();
    };
  }, [forceCleanup]);

  // Listen for memory pressure events
  useEffect(() => {
    const handleMemoryWarning = () => {
      console.warn('Memory pressure detected, forcing cleanup');
      forceCleanup();
    };

    // Listen for page visibility changes to cleanup when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Cleanup when tab becomes hidden
        setTimeout(forceCleanup, 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for memory pressure (if supported)
    if ('onmemorywarning' in window) {
      window.addEventListener('memorywarning', handleMemoryWarning);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('onmemorywarning' in window) {
        window.removeEventListener('memorywarning', handleMemoryWarning);
      }
    };
  }, [forceCleanup]);

  return {
    getMemoryStats,
    checkMemoryUsage,
    registerCleanup,
    forceCleanup
  };
};