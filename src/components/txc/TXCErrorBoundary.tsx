import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class TXCErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TXC Error Boundary] Error caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log security event for TXC-related errors
    if (error.message.includes('TXC') || error.stack?.includes('txc')) {
      console.warn('[TXC Security] Error boundary triggered for TXC operation', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isTXCError = this.state.error?.message.includes('TXC') || 
                        this.state.error?.stack?.includes('txc');

      return (
        <Card className="w-full max-w-md mx-auto mt-8 border-destructive">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">
              {isTXCError ? 'TXC Operation Error' : 'Something went wrong'}
            </CardTitle>
            <CardDescription>
              {isTXCError 
                ? 'There was an issue with your TXC transaction. Your account remains secure.'
                : 'An unexpected error occurred. Please try again.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error?.message}
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleReset}
                variant={canRetry ? "default" : "outline"}
                className="flex-1"
                size="sm"
              >
                Reset
              </Button>
            </div>
            
            {isTXCError && (
              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support. 
                Your TXC balance and transactions are protected.
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}