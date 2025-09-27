import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ReactDispatcherRecoveryState {
  hasError: boolean;
  retryCount: number;
  error: Error | null;
  isRecovering: boolean;
}

interface ReactDispatcherRecoveryProps {
  children: ReactNode;
  maxRetries?: number;
  onRecovery?: () => void;
  fallbackComponent?: ReactNode;
}

export class ReactDispatcherRecovery extends Component<
  ReactDispatcherRecoveryProps,
  ReactDispatcherRecoveryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ReactDispatcherRecoveryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      error: null,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ReactDispatcherRecoveryState> {
    // Check if this is a React dispatcher error
    const isDispatcherError = 
      error.message.includes('dispatcher.useState') ||
      error.message.includes('dispatcher.useEffect') ||
      error.message.includes('null is not an object') ||
      error.message.includes('Cannot read properties of null');

    if (isDispatcherError) {
      console.error('🔥 React Dispatcher Error Detected:', error.message);
      return {
        hasError: true,
        error,
        isRecovering: true,
      };
    }

    return {};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔍 React Dispatcher Recovery - Full Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });

    // Attempt automatic recovery for dispatcher errors
    if (this.isDispatcherError(error) && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.attemptRecovery();
    }
  }

  private isDispatcherError(error: Error): boolean {
    return (
      error.message.includes('dispatcher.useState') ||
      error.message.includes('dispatcher.useEffect') ||
      error.message.includes('null is not an object') ||
      error.message.includes('Cannot read properties of null')
    );
  }

  private attemptRecovery = () => {
    console.log(`🔄 Attempting React recovery (attempt ${this.state.retryCount + 1})`);
    
    this.setState({ isRecovering: true });

    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Attempt recovery with increasing delays
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000);
    
    this.retryTimeout = setTimeout(() => {
      console.log('🚀 Initiating React context recovery...');
      
      // Force React to reinitialize by clearing error state
      this.setState(prevState => ({
        hasError: false,
        retryCount: prevState.retryCount + 1,
        error: null,
        isRecovering: false,
      }));

      // Call recovery callback if provided
      if (this.props.onRecovery) {
        this.props.onRecovery();
      }
    }, delay);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default fallback with recovery options
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              {this.state.isRecovering ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {this.state.isRecovering ? 'Recovering...' : 'Application Error'}
              </h2>
              <p className="text-muted-foreground">
                {this.state.isRecovering 
                  ? 'Attempting to restore the application...'
                  : 'React context initialization failed. This usually resolves automatically.'
                }
              </p>
            </div>

            {!this.state.isRecovering && (
              <div className="space-y-3">
                <button 
                  onClick={this.attemptRecovery}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  disabled={this.state.retryCount >= (this.props.maxRetries || 3)}
                >
                  {this.state.retryCount >= (this.props.maxRetries || 3) ? 'Max Retries Reached' : 'Try Again'}
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="block mx-auto px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-32">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}