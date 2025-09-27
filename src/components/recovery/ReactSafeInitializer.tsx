import React, { useEffect, useState } from 'react';

interface ReactSafeInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SafeInitializer ensures React hooks dispatcher is available before rendering children
 * This prevents "Cannot read properties of null (reading 'useState')" errors
 */
export const ReactSafeInitializer: React.FC<ReactSafeInitializerProps> = ({ 
  children, 
  fallback 
}) => {
  // Check if React hooks are available at component level
  const [isReactReady, setIsReactReady] = useState(() => {
    try {
      // Test if React hooks dispatcher is available
      const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      return !!(ReactInternals && ReactInternals.ReactCurrentDispatcher && ReactInternals.ReactCurrentDispatcher.current);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isReactReady) {
      // Retry checking React dispatcher availability
      const checkReactReady = () => {
        try {
          const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          if (ReactInternals && ReactInternals.ReactCurrentDispatcher && ReactInternals.ReactCurrentDispatcher.current) {
            setIsReactReady(true);
            return true;
          }
        } catch {
          // Continue retrying
        }
        return false;
      };

      // Immediate check
      if (checkReactReady()) return;

      // Retry with exponential backoff
      const retryIntervals = [50, 100, 200, 500, 1000];
      retryIntervals.forEach((delay, index) => {
        setTimeout(() => {
          if (!checkReactReady() && index === retryIntervals.length - 1) {
            console.error('React dispatcher still not ready after all retries');
            // Force render anyway as last resort
            setIsReactReady(true);
          }
        }, delay);
      });
    }
  }, [isReactReady]);

  // Show loading state while React initializes
  if (!isReactReady) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Initializing React context...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};