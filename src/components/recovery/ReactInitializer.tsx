import React, { useState, useEffect, useRef } from 'react';

interface ReactInitializerProps {
  children: React.ReactNode;
  onInitialized?: () => void;
}

interface InitializationState {
  isReady: boolean;
  attempt: number;
  lastError: string | null;
}

export const ReactInitializer: React.FC<ReactInitializerProps> = ({ 
  children, 
  onInitialized 
}) => {
  const [state, setState] = useState<InitializationState>({
    isReady: false,
    attempt: 0,
    lastError: null
  });
  
  const initRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    const initializeReact = () => {
      console.log('🎯 ReactInitializer: Starting React context verification...');
      
      try {
        // Test React hooks availability
        const testHooksAvailability = () => {
          try {
            // Try to access React internals to verify dispatcher is available
            const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
            
            if (!ReactInternals || !ReactInternals.ReactCurrentDispatcher) {
              throw new Error('React dispatcher not available');
            }

            const dispatcher = ReactInternals.ReactCurrentDispatcher.current;
            if (!dispatcher || !dispatcher.useState) {
              throw new Error('React hooks dispatcher not ready');
            }

            return true;
          } catch (error) {
            console.warn('React hooks test failed:', error);
            return false;
          }
        };

        // Perform the test
        const hooksReady = testHooksAvailability();
        
        if (hooksReady) {
          console.log('✅ React dispatcher verified - hooks are ready');
          setState({
            isReady: true,
            attempt: state.attempt + 1,
            lastError: null
          });
          
          if (onInitialized) {
            onInitialized();
          }
        } else {
          throw new Error('React hooks dispatcher not ready');
        }
        
      } catch (error: any) {
        console.error('❌ React initialization failed:', error.message);
        
        setState(prev => ({
          isReady: false,
          attempt: prev.attempt + 1,
          lastError: error.message
        }));

        // Retry with exponential backoff (max 3 attempts)
        if (state.attempt < 3) {
          const delay = Math.min(500 * Math.pow(2, state.attempt), 2000);
          console.log(`🔄 Retrying React initialization in ${delay}ms (attempt ${state.attempt + 1}/3)`);
          
          timeoutRef.current = setTimeout(() => {
            initRef.current = false; // Allow retry
            initializeReact();
          }, delay);
        } else {
          console.error('💥 React initialization failed after 3 attempts');
        }
      }
    };

    // Start initialization after a brief delay to ensure DOM is ready
    timeoutRef.current = setTimeout(initializeReact, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.attempt, onInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show loading state while React is initializing
  if (!state.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              Initializing Application
            </h3>
            <p className="text-sm text-muted-foreground">
              Setting up React context... (Attempt {state.attempt}/3)
            </p>
            {state.lastError && process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-destructive">
                {state.lastError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // React is ready, render children
  return <>{children}</>;
};