/**
 * Error resilience system - like giant apps use
 * Graceful degradation and error recovery
 */

class ErrorResilientSystem {
  private static instance: ErrorResilientSystem;
  private errorCounts = new Map<string, number>();
  private fallbackData = new Map<string, any>();
  
  static getInstance() {
    if (!ErrorResilientSystem.instance) {
      ErrorResilientSystem.instance = new ErrorResilientSystem();
    }
    return ErrorResilientSystem.instance;
  }

  /**
   * Wrap API calls with error resilience
   */
  async resilientCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    try {
      const result = await apiCall();
      // Reset error count on success
      this.errorCounts.delete(key);
      return result;
    } catch (error) {
      console.warn(`API call failed for ${key}:`, error);
      
      // Increment error count
      const count = this.errorCounts.get(key) || 0;
      this.errorCounts.set(key, count + 1);
      
      // Return fallback data if available
      if (fallback !== undefined) {
        return fallback;
      }
      
      // Try cached fallback
      const cached = this.fallbackData.get(key);
      if (cached) {
        return cached;
      }
      
      // If too many errors, return minimal fallback
      if (count >= 3) {
        return this.getMinimalFallback<T>(key);
      }
      
      throw error;
    }
  }

  /**
   * Set fallback data for specific keys
   */
  setFallback<T>(key: string, data: T) {
    this.fallbackData.set(key, data);
  }

  private getMinimalFallback<T>(key: string): T {
    const fallbacks: Record<string, any> = {
      posts: [],
      notifications: [],
      profile: null,
      jobs: [],
      connections: [],
    };
    
    return fallbacks[key] || null;
  }
}

export const errorResilience = ErrorResilientSystem.getInstance();

/**
 * Database query wrapper with error resilience
 */
export async function resilientQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  return errorResilience.resilientCall(queryKey, queryFn, fallback);
}

import React from 'react';

/**
 * Component error boundary with automatic retry
 */

export class AutoRetryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; retryCount: number }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component error:', error, errorInfo);
    
    // Auto-retry after a delay
    if (this.state.retryCount < 2) {
      setTimeout(() => {
        this.setState(state => ({
          hasError: false,
          retryCount: state.retryCount + 1
        }));
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return React.createElement(Fallback);
      }
      
      return React.createElement('div', { className: 'text-center p-4' }, [
        React.createElement('p', { key: 'loading', className: 'text-muted-foreground' }, 'Loading...'),
        this.state.retryCount >= 2 && React.createElement('button', {
          key: 'refresh',
          onClick: () => window.location.reload(),
          className: 'mt-2 px-4 py-2 bg-primary text-primary-foreground rounded'
        }, 'Refresh Page')
      ]);
    }

    return this.props.children;
  }
}