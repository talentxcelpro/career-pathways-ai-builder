import React from 'react';
import { RefreshCw } from 'lucide-react';

interface BundleErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

// Check if error is actually a chunk loading error
const isChunkLoadError = (error?: Error): boolean => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  return (
    error.name === 'ChunkLoadError' ||
    message.includes('loading chunk') ||
    message.includes('loading css chunk') ||
    message.includes('failed to fetch dynamically imported module') ||
    stack.includes('chunk')
  );
};

export const BundleErrorFallback: React.FC<BundleErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  // If this is not a chunk load error, try to recover silently
  React.useEffect(() => {
    if (!isChunkLoadError(error) && resetErrorBoundary) {
      console.log('Non-chunk error detected, attempting silent recovery');
      setTimeout(() => resetErrorBoundary(), 100);
    }
  }, [error, resetErrorBoundary]);

  // Don't show the error screen for non-chunk errors
  if (!isChunkLoadError(error)) {
    return null;
  }

  const handleRefresh = () => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Don't clear localStorage - only session storage
    sessionStorage.clear();
    
    // Hard reload to bypass cache
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-destructive text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">App Update Required</h1>
        <p className="text-muted-foreground">
          We've detected a version mismatch. This usually happens after an app update.
          Please refresh to get the latest version.
        </p>
        
        {error && (
          <details className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <summary>Technical Details</summary>
            <p className="mt-2 font-mono">{error.message}</p>
          </details>
        )}
        
        <div className="space-y-3">
          <button 
            onClick={handleRefresh}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh App
          </button>
          
          {resetErrorBoundary && (
            <button 
              onClick={resetErrorBoundary}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          If this problem persists, please clear your browser cache and try again.
        </p>
      </div>
    </div>
  );
};