import React from 'react';

interface ReactContextErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ReactContextErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ReactContextErrorBoundary extends React.Component<
  ReactContextErrorBoundaryProps,
  ReactContextErrorBoundaryState
> {
  constructor(props: ReactContextErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ReactContextErrorBoundaryState {
    console.error('React Context Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Context Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo
    });

    // Check if this is a React hooks dispatcher error
    if (error.message.includes('dispatcher.useState') || 
        error.message.includes('dispatcher.useEffect') ||
        error.message.includes('null is not an object')) {
      console.error('React hooks dispatcher error detected - React may not be properly initialized');
      
      // Try to reinitialize React context
      setTimeout(() => {
        console.log('Attempting to recover from React context error...');
        this.setState({ hasError: false, error: null });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Initialization Error
            </h2>
            <p className="text-gray-600 mb-4">
              The application is having trouble initializing. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack || this.state.error?.message}
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