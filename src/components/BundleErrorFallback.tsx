import React, { useEffect } from 'react';

interface BundleErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const BundleErrorFallback: React.FC<BundleErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  // Check if the error is a deployment chunk mismatch or dynamic module loading failure
  useEffect(() => {
    const errorMsg = error?.message?.toLowerCase() || '';
    const errorName = error?.name?.toLowerCase() || '';
    
    const isChunkOrDeployError = 
      errorMsg.includes('failed to fetch dynamically imported module') ||
      errorMsg.includes('loading chunk') ||
      errorMsg.includes('loading css chunk') ||
      errorMsg.includes('dynamically imported') ||
      errorName.includes('chunkloaderror') ||
      errorMsg.includes('mime type');

    if (isChunkOrDeployError) {
      const lastReload = parseInt(sessionStorage.getItem('last_chunk_reload') || '0', 10);
      const now = Date.now();
      
      // Auto-reload to load the fresh deployment chunks immediately
      if (now - lastReload > 8000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        try {
          if ('caches' in window) {
            caches.keys().then(names => names.forEach(name => caches.delete(name)));
          }
        } catch (e) {}
        window.location.reload();
      }
    }
  }, [error]);

  const handleRefresh = () => {
    try {
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
      }
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg className="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Updating TalentXcel
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A new version of the platform was recently deployed. We are syncing the latest updates and performance improvements.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <button 
            onClick={handleRefresh}
            className="w-full h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            Reload Latest Version
          </button>
          
          <div className="flex gap-2">
            {resetErrorBoundary && (
              <button 
                onClick={resetErrorBoundary}
                className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
              >
                Try Again
              </button>
            )}
            <button 
              onClick={handleGoHome}
              className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleErrorFallback;