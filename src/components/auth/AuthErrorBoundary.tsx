import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Only show error boundary for critical errors, not auth session issues
    const isAuthSessionError = error.message?.includes('Auth session missing') || 
                              error.message?.includes('JWT') ||
                              error.message?.includes('session');
    
    // Don't show error boundary for normal auth session issues
    if (isAuthSessionError) {
      console.warn('Auth session error handled gracefully:', error.message);
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log critical errors
    const isAuthSessionError = error.message?.includes('Auth session missing') || 
                              error.message?.includes('JWT') ||
                              error.message?.includes('session');
    
    if (!isAuthSessionError) {
      console.error('Auth Error Boundary caught an error:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    // Clear all potentially corrupted auth data
    localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('secure_session');
    sessionStorage.clear();
    
    // Reset error state
    this.setState({ hasError: false, error: undefined });
    
    // Force reload to reinitialize auth completely
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an authentication error. This usually happens when your session has expired or there's a cache issue.
            </p>
            <div className="space-y-2">
              <button 
                onClick={this.handleRetry}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}