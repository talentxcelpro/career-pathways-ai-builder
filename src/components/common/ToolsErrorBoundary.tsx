import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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

export class ToolsErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ToolsErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service if needed
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`Retrying... Attempt ${this.state.retryCount + 1}/${this.maxRetries}`);
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
          <Card className="max-w-lg w-full border-destructive/20 bg-background/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Tools Loading Error</CardTitle>
              <CardDescription>
                We encountered an issue while loading the tools page. This is usually temporary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Error Details:</h4>
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {this.state.retryCount < this.maxRetries ? (
                  <Button onClick={this.handleRetry} className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.state.retryCount + 1}/{this.maxRetries})
                  </Button>
                ) : (
                  <Button onClick={this.handleReload} className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleGoHome} className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                If this problem persists, please contact support.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}