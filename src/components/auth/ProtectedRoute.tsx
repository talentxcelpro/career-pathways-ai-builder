
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { recordUserIntent, isValidInternalPath } from '@/utils/intentRouting';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session, refreshSession } = useOptimizedAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Auto-refresh expired access token without wiping local storage
  useEffect(() => {
    if (!loading && session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= session.expires_at && !refreshAttempted && !isRefreshing) {
        setIsRefreshing(true);
        setRefreshAttempted(true);
        refreshSession()
          .catch((err) => console.warn('[ProtectedRoute] Token refresh failed:', err))
          .finally(() => setIsRefreshing(false));
      }
    }
  }, [loading, session, refreshAttempted, isRefreshing, refreshSession]);

  // Show loading spinner while checking auth or refreshing token
  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user or session
  if (!user || !session) {
    const targetPath = `${location.pathname}${location.search}${location.hash}`;
    if (isValidInternalPath(targetPath)) {
      recordUserIntent(null, targetPath);
    }
    const loginUrl = isValidInternalPath(targetPath)
      ? `/auth/login?returnTo=${encodeURIComponent(targetPath)}`
      : '/auth/login';

    return <Navigate to={loginUrl} state={{ from: location, reason: 'unauthorized' }} replace />;
  }

  return <>{children}</>;
};
