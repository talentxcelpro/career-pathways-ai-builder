import React from 'react';

interface ReactErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ReactErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ReactErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ReactErrorBoundaryState {
    console.error('React Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary - Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '16px' }}>
            Application Error
          </h1>
          <p style={{ color: '#6c757d', marginBottom: '24px', maxWidth: '500px' }}>
            The application encountered an error. This might be due to a React initialization issue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Application
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '24px', maxWidth: '600px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#495057'
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}