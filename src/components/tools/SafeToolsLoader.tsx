import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealToolsData } from '@/hooks/useRealToolsData';

interface SafeToolsLoaderProps {
  children: (data: {
    tools: any[];
    toolsByCategory: Record<string, any[]>;
    userStats: any;
    userName: string;
    userTXCBalance: number;
    isLoading: boolean;
    getToolBySlug: (slug: string) => any;
  }) => React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafeToolsLoader: React.FC<SafeToolsLoaderProps> = ({ children, fallback }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  const maxRetries = 3;
  const loadingTimeoutMs = 15000; // 15 seconds

  useEffect(() => {
    // Reset error state when retrying
    setHasError(false);
    setLoadingTimeout(false);

    // Set timeout for loading
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, loadingTimeoutMs);

    return () => clearTimeout(timeout);
  }, [retryCount]);

  let toolsData;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    toolsData = useRealToolsData();
  } catch (error) {
    console.error('Error in useRealToolsData:', error);
    setHasError(true);
  }

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      setLoadingTimeout(false);
    } else {
      window.location.reload();
    }
  };

  // Error state
  if (hasError) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Loading Failed</CardTitle>
            <CardDescription>
              Unable to load tools data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              {retryCount < maxRetries ? `Retry (${retryCount + 1}/${maxRetries})` : 'Reload Page'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state with timeout
  if (!toolsData || toolsData.isLoading) {
    if (loadingTimeout) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-warning/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-warning/10">
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <CardTitle className="text-warning">Taking Longer Than Expected</CardTitle>
              <CardDescription>
                The tools are taking a while to load. This might be due to network issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Still loading...
              </div>
              <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your personalized toolkit...</p>
          <div className="text-xs text-muted-foreground">
            This usually takes just a few seconds
          </div>
        </div>
      </div>
    );
  }

  // Validate data before rendering
  if (!toolsData.tools || !Array.isArray(toolsData.tools)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-warning/20">
          <CardHeader className="text-center">
            <CardTitle className="text-warning">Invalid Data</CardTitle>
            <CardDescription>
              The tools data appears to be corrupted. Please refresh the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children with validated data
  return <>{children(toolsData)}</>;
};