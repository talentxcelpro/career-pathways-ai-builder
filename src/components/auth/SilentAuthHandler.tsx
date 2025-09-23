import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SilentAuthHandlerProps {
  children: React.ReactNode;
}

/**
 * Silently handles authentication errors without showing error boundaries
 * Provides a better user experience by gracefully handling session issues
 */
export const SilentAuthHandler: React.FC<SilentAuthHandlerProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Global error handler for auth-related errors
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? event.reason : event.error;
      
      // Silently handle common auth errors that shouldn't crash the app
      if (error?.message?.includes('Auth session missing') ||
          error?.message?.includes('JWT') ||
          error?.message?.includes('session') ||
          error?.name === 'AuthSessionMissingError') {
        
        // Prevent error from bubbling up to error boundaries
        event.preventDefault?.();
        
        console.log('Auth error handled silently:', error.message);
        
        // Only redirect if user was expecting to be authenticated
        const isOnProtectedRoute = window.location.pathname.includes('/dashboard') || 
                                 window.location.pathname.includes('/profile') ||
                                 window.location.pathname.includes('/admin');
        
        if (isOnProtectedRoute && !loading && !user) {
          console.log('Redirecting from protected route to login');
          navigate('/auth/login', { 
            state: { from: window.location.pathname },
            replace: true 
          });
        }
        
        return;
      }
    };

    // Catch both regular errors and promise rejections
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, [user, loading, navigate]);

  return <>{children}</>;
};