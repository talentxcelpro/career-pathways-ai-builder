
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Validate session isn't expired
  if (session) {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    if (expiresAt && now >= expiresAt) {
      console.log('Session expired in ProtectedRoute');
      // Clear expired session data
      localStorage.clear();
      sessionStorage.clear();
      return <Navigate to="/auth/login" state={{ from: location, reason: 'expired' }} replace />;
    }
  }

  // Redirect to auth if no user or session
  if (!user || !session) {
    return <Navigate to="/auth/login" state={{ from: location, reason: 'unauthorized' }} replace />;
  }

  return <>{children}</>;
};
