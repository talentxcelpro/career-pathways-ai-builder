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
    // Never show error UI - just render children
    return this.props.children;
  }
}