import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Optimized auth hook that reduces excessive API calls
 * and improves performance with intelligent caching
 */
export const useOptimizedAuth = () => {
  const lastCheckRef = useRef<number>(0);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef<boolean>(false);

  // Throttled auth check - only check every 30 seconds minimum
  const throttledAuthCheck = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckRef.current;
    
    // Don't check more than once every 30 seconds
    if (timeSinceLastCheck < 30000 || isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      // This will use the cached session if it's still valid
      const { data: { session } } = await supabase.auth.getSession();
      
      // Schedule next check for 5 minutes if session exists, 30 seconds if not
      const nextCheckDelay = session ? 300000 : 30000;
      
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
      
      cacheTimeoutRef.current = setTimeout(() => {
        isCheckingRef.current = false;
      }, nextCheckDelay);
      
    } catch (error) {
      console.warn('Optimized auth check failed:', error);
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial check
    throttledAuthCheck();

    // Set up periodic checks with smart intervals
    const interval = setInterval(() => {
      throttledAuthCheck();
    }, 60000); // Check every minute, but throttling will limit actual calls

    return () => {
      clearInterval(interval);
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, [throttledAuthCheck]);

  return { throttledAuthCheck };
};