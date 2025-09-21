
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth with timeout
  if (loading) {
    // Add timeout to prevent infinite loading
    React.useEffect(() => {
      const timer = setTimeout(() => {
        console.warn('Auth check taking too long, redirecting to login');
        window.location.href = '/auth/login';
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
          <p className="text-xs text-muted-foreground/60">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Validate session isn't expired with better error handling
  if (session) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      if (expiresAt && now >= expiresAt) {
        console.log('Session expired in ProtectedRoute');
        // Clear all auth-related storage
        localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
        localStorage.removeItem('secure_session');
        sessionStorage.clear();
        return <Navigate to="/auth/login" state={{ from: location, reason: 'expired' }} replace />;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Clear corrupted session data
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      sessionStorage.clear();
      return <Navigate to="/auth/login" state={{ from: location, reason: 'error' }} replace />;
    }
  }

  // Redirect to auth if no user or session
  if (!user || !session) {
    return <Navigate to="/auth/login" state={{ from: location, reason: 'unauthorized' }} replace />;
  }

  return <>{children}</>;
};
