import { useMemo, useState, useCallback } from 'react';

/**
 * Safe toast hook that only executes when React dispatcher is available
 * Provides fallback behavior when hooks are not ready
 */
export function useSafeToast() {
  // Check if React hooks dispatcher is available
  const isReactReady = useMemo(() => {
    try {
      const React = require('react');
      const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      return !!(ReactInternals && ReactInternals.ReactCurrentDispatcher && ReactInternals.ReactCurrentDispatcher.current);
    } catch {
      return false;
    }
  }, []);

  // Safe state with fallback
  const [state, setState] = useState(() => {
    if (!isReactReady) {
      return { toasts: [] };
    }
    
    try {
      // Try to import the actual hook state
      const { useToast } = require('@/hooks/use-toast');
      const { toasts } = useToast();
      return { toasts };
    } catch {
      return { toasts: [] };
    }
  });

  // Safe toast function with fallback
  const toast = useCallback((options: any) => {
    if (!isReactReady) {
      // Fallback: log to console when React hooks are not ready
      console.log('Toast (fallback):', options);
      return { id: 'fallback', dismiss: () => {}, update: () => {} };
    }

    try {
      const { toast: actualToast } = require('@/hooks/use-toast');
      return actualToast(options);
    } catch (error) {
      console.warn('Toast error, using fallback:', error);
      console.log('Toast (fallback):', options);
      return { id: 'fallback', dismiss: () => {}, update: () => {} };
    }
  }, [isReactReady]);

  const dismiss = useCallback((toastId?: string) => {
    if (!isReactReady) {
      console.log('Toast dismiss (fallback):', toastId);
      return;
    }

    try {
      const { useToast } = require('@/hooks/use-toast');
      const { dismiss: actualDismiss } = useToast();
      actualDismiss(toastId);
    } catch (error) {
      console.warn('Toast dismiss error:', error);
    }
  }, [isReactReady]);

  return {
    ...state,
    toast,
    dismiss,
    isReady: isReactReady
  };
}