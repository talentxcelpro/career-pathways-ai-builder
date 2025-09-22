import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const AuthErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/20 w-fit">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <p className="text-sm text-muted-foreground">
            There was an error loading the authentication page.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <p className="font-medium mb-1">Error details:</p>
            <p className="text-xs">{error.message}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={resetErrorBoundary} 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface AuthErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

export const AuthErrorBoundaryWrapper: React.FC<AuthErrorBoundaryWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Auth page error:', error, errorInfo);
        
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
          // Could send to error tracking service
        }
      }}
      onReset={() => {
        // Clear any error state
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};