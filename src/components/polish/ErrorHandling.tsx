import React, { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  XCircle,
  Info,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class EnhancedErrorBoundary extends React.Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="p-6 text-center">
      <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={retry} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

// Network status indicator
export const NetworkStatusIndicator: React.FC = memo(() => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
        <Wifi className="w-3 h-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="w-4 h-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You're offline. Some features may not work.</span>
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          Last online: {lastOnline.toLocaleTimeString()}
        </Badge>
      </AlertDescription>
    </Alert>
  );
});

// Retry mechanism for failed operations
interface RetryWrapperProps {
  children: React.ReactNode;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  error?: Error | null;
  loading?: boolean;
}

export const RetryWrapper: React.FC<RetryWrapperProps> = memo(({
  children,
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  error,
  loading
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      await onRetry();
      setRetryCount(0);
      toast.success('Operation completed successfully');
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error(`Retry ${retryCount + 1}/${maxRetries} failed`);
    } finally {
      setIsRetrying(false);
    }
  };

  if (error && !loading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-800 mb-1">Operation Failed</h4>
              <p className="text-sm text-amber-700 mb-3">{error.message}</p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying || retryCount >= maxRetries}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry ({retryCount}/{maxRetries})
                    </>
                  )}
                </Button>
                
                {retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Attempt {retryCount + 1}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
});

// Loading states with timeout
interface TimedLoadingProps {
  loading: boolean;
  timeout?: number;
  onTimeout?: () => void;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TimedLoading: React.FC<TimedLoadingProps> = memo(({
  loading,
  timeout = 10000,
  onTimeout,
  children,
  fallback
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
      toast.error('Loading is taking longer than expected');
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout, onTimeout]);

  if (loading && !hasTimedOut) {
    return (
      <>{fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}</>
    );
  }

  if (loading && hasTimedOut) {
    return (
      <Alert variant="destructive">
        <Clock className="w-4 h-4" />
        <AlertDescription>
          Loading is taking longer than expected. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
});

// Success feedback component
interface SuccessFeedbackProps {
  show: boolean;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = memo(({
  show,
  message,
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  return (
    <Alert className="border-green-300 bg-green-50 text-green-800">
      <CheckCircle className="w-4 h-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-auto p-1 text-green-600 hover:text-green-800"
          >
            ×
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
});

// Enhanced form validation feedback
interface ValidationFeedbackProps {
  field: string;
  errors: string[];
  touched: boolean;
  success?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = memo(({
  field,
  errors,
  touched,
  success = false
}) => {
  if (!touched) return null;

  if (success && errors.length === 0) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
        <CheckCircle className="w-3 h-3" />
        <span>Looks good!</span>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="space-y-1 mt-1">
        {errors.map((error, index) => (
          <div key={index} className="flex items-center gap-1 text-destructive text-xs">
            <XCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
});

NetworkStatusIndicator.displayName = 'NetworkStatusIndicator';
RetryWrapper.displayName = 'RetryWrapper';
TimedLoading.displayName = 'TimedLoading';
SuccessFeedback.displayName = 'SuccessFeedback';
ValidationFeedback.displayName = 'ValidationFeedback';