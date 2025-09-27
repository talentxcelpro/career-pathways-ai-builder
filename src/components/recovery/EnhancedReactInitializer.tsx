import React, { useState, useEffect, useRef } from 'react';

interface EnhancedReactInitializerProps {
  children: React.ReactNode;
  onInitialized?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface InitializationState {
  isReady: boolean;
  attempt: number;
  lastError: string | null;
  isRetrying: boolean;
}

/**
 * Enhanced React Initializer with better error handling and recovery
 */
export const EnhancedReactInitializer: React.FC<EnhancedReactInitializerProps> = ({ 
  children, 
  onInitialized,
  maxRetries = 5,
  retryDelay = 1000
}) => {
  const [state, setState] = useState<InitializationState>({
    isReady: false,
    attempt: 0,
    lastError: null,
    isRetrying: false
  });
  
  const initRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const verifyReactReadiness = React.useCallback(() => {
    try {
      // Simplified React readiness check without calling hooks
      
      // 1. Check React object existence
      if (!React || typeof React !== 'object') {
        throw new Error('React object not available');
      }

      // 2. Check basic hooks functions exist
      if (typeof React.useState !== 'function' || typeof React.useEffect !== 'function') {
        throw new Error('React hooks not available');
      }

      // 3. Check React internals (without testing dispatcher)
      const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (!ReactInternals) {
        throw new Error('React internals not available');
      }

      if (!ReactInternals.ReactCurrentDispatcher) {
        throw new Error('React dispatcher context not available');
      }

      // Don't test dispatcher methods directly to avoid hook call errors
      return true;
    } catch (error) {
      console.warn('React readiness check failed:', error);
      return false;
    }
  }, []);

  const initializeReact = React.useCallback(() => {
    console.log(`🎯 Enhanced React initialization attempt ${state.attempt + 1}/${maxRetries}`);
    
    setState(prev => ({ 
      ...prev, 
      attempt: prev.attempt + 1, 
      isRetrying: true,
      lastError: null
    }));

    try {
      if (verifyReactReadiness()) {
        console.log('✅ React fully verified and ready');
        setState(prev => ({
          ...prev,
          isReady: true,
          isRetrying: false,
          lastError: null
        }));
        
        if (onInitialized) {
          onInitialized();
        }
        return true;
      } else {
        throw new Error('React readiness verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown initialization error';
      console.error('❌ React initialization failed:', errorMessage);
      
      setState(prev => ({
        ...prev,
        isReady: false,
        isRetrying: false,
        lastError: errorMessage
      }));

      // Retry logic
      if (state.attempt < maxRetries) {
        const delay = Math.min(retryDelay * Math.pow(1.5, state.attempt), 5000);
        console.log(`🔄 Retrying in ${delay}ms (attempt ${state.attempt + 1}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          initRef.current = false; // Allow retry
          initializeReact();
        }, delay);
      } else {
        console.error('💥 React initialization failed after all attempts');
        // Force render as last resort
        setState(prev => ({
          ...prev,
          isReady: true,
          isRetrying: false,
          lastError: `Failed after ${maxRetries} attempts: ${errorMessage}`
        }));
      }
      return false;
    }
  }, [state.attempt, maxRetries, retryDelay, verifyReactReadiness, onInitialized]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    // Start initialization after a brief delay to ensure DOM is ready
    timeoutRef.current = setTimeout(() => {
      initializeReact();
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [initializeReact]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state while React is initializing
  if (!state.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            {state.isRetrying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {state.isRetrying ? 'Retrying...' : 'Initializing Application'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Setting up React environment... (Attempt {state.attempt}/{maxRetries})
            </p>
            
            {state.lastError && process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Error Details
                </summary>
                <p className="mt-2 p-2 bg-muted rounded text-xs text-destructive">
                  {state.lastError}
                </p>
              </details>
            )}
          </div>

          {state.attempt >= maxRetries && (
            <button 
              onClick={() => {
                setState({ isReady: false, attempt: 0, lastError: null, isRetrying: false });
                initRef.current = false;
                initializeReact();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // React is ready, render children
  return <>{children}</>;
};