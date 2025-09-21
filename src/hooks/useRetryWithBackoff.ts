import { useCallback, useState } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError?: Error;
}

export function useRetryWithBackoff<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0
  });

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    let attempt = 0;
    let delay = initialDelay;

    while (attempt <= maxRetries) {
      try {
        setRetryState(prev => ({ 
          ...prev, 
          isRetrying: attempt > 0, 
          retryCount: attempt 
        }));

        const result = await fn(...args);
        
        // Reset state on success
        setRetryState({ isRetrying: false, retryCount: 0 });
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        setRetryState(prev => ({ 
          ...prev, 
          lastError: error instanceof Error ? error : new Error(String(error)),
          retryCount: attempt + 1
        }));

        if (isLastAttempt) {
          setRetryState(prev => ({ ...prev, isRetrying: false }));
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next attempt
        delay = Math.min(delay * backoffFactor, maxDelay);
        attempt++;
      }
    }

    throw new Error('Unexpected error in retry logic');
  }, [fn, maxRetries, initialDelay, maxDelay, backoffFactor]);

  const reset = useCallback(() => {
    setRetryState({ isRetrying: false, retryCount: 0 });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...retryState
  };
}