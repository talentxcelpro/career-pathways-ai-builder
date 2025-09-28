import React from 'react';
import { RefreshCw } from 'lucide-react';

interface BundleErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const BundleErrorFallback: React.FC<BundleErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const handleRefresh = () => {
    // Comprehensive cleanup to prevent version conflicts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to clean URL instead of reload
    window.location.href = window.location.origin + window.location.pathname;
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