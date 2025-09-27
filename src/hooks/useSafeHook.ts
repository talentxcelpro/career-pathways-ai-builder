import React, { useRef, useCallback } from 'react';

/**
 * Safe hook wrapper that only executes hooks when React dispatcher is available
 */
export function useSafeHook() {
  const isReactReadyRef = useRef(false);

  // Check if React hooks dispatcher is available
  const checkReactReady = useCallback(() => {
    try {
      const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (ReactInternals && ReactInternals.ReactCurrentDispatcher && ReactInternals.ReactCurrentDispatcher.current) {
        isReactReadyRef.current = true;
        return true;
      }
    } catch {
      // React internals not available
    }
    return false;
  }, []);

  const safeUseState = useCallback(<T>(initialValue: T): [T, (value: T) => void] => {
    if (!isReactReadyRef.current && !checkReactReady()) {
      // Return a safe fallback when React is not ready
      return [initialValue, () => {}];
    }
    
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return React.useState(initialValue);
    } catch (error) {
      console.warn('Safe useState fallback:', error);
      return [initialValue, () => {}];
    }
  }, [checkReactReady]);

  const safeUseEffect = useCallback((effect: () => void | (() => void), deps?: any[]) => {
    if (!isReactReadyRef.current && !checkReactReady()) {
      return;
    }
    
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return React.useEffect(effect, deps);
    } catch (error) {
      console.warn('Safe useEffect fallback:', error);
    }
  }, [checkReactReady]);

  return {
    isReactReady: isReactReadyRef.current || checkReactReady(),
    safeUseState,
    safeUseEffect
  };
}

/**
 * Higher-order component that only renders children when React is ready
 */
export function withSafeHooks<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function SafeComponent(props: P) {
    const { isReactReady } = useSafeHook();
    
    if (!isReactReady) {
      return React.createElement('div', {
        className: "min-h-screen flex items-center justify-center bg-background"
      }, React.createElement('div', {
        className: "text-center space-y-4"
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"
        }),
        React.createElement('p', {
          key: 'text',
          className: "text-sm text-muted-foreground"
        }, "Initializing hooks...")
      ]));
    }
    
    return React.createElement(Component, props);
  };
}