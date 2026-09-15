
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { isAuthSessionFailure, isTransientAuthError } from '@/utils/authErrors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session, refreshSession } = useOptimizedAuth();
  const location = useLocation();
  const [isRefreshingExpiredSession, setIsRefreshingExpiredSession] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [attemptedRefreshExpiry, setAttemptedRefreshExpiry] = useState<number | null>(null);

  const expiresAt = session?.expires_at;
  const isExpired = !!expiresAt && Math.floor(Date.now() / 1000) >= expiresAt;
  const hasAttemptedRefresh = attemptedRefreshExpiry === expiresAt;

  useEffect(() => {
    if (!session || !isExpired || isRefreshingExpiredSession || refreshFailed || hasAttemptedRefresh) return;

    let cancelled = false;
    setIsRefreshingExpiredSession(true);
    setAttemptedRefreshExpiry(expiresAt ?? null);

    refreshSession()
      .then(() => {
        if (!cancelled) setRefreshFailed(false);
      })
      .catch((error) => {
        console.error('Expired session refresh failed:', error);
        if (!cancelled && isAuthSessionFailure(error) && !isTransientAuthError(error)) {
          setRefreshFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsRefreshingExpiredSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, expiresAt, isExpired, isRefreshingExpiredSession, refreshFailed, hasAttemptedRefresh, refreshSession]);

  // Show loading spinner while checking auth
  if (loading || isRefreshingExpiredSession || (session && isExpired && !refreshFailed && !hasAttemptedRefresh)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isExpired ? 'Refreshing your session...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  if (refreshFailed) {
    return <Navigate to="/auth/login" state={{ from: location, reason: 'expired' }} replace />;
  }

  // Redirect to auth if no user or session
  if (!user || !session) {
    return <Navigate to="/auth/login" state={{ from: location, reason: 'unauthorized' }} replace />;
  }

  return <>{children}</>;
};
