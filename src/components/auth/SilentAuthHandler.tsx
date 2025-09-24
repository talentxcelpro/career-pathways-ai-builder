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
    // Global error handler for auth-related errors - more selective
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? event.reason : event.error;
      
      // Only handle actual critical auth errors, ignore normal session states
      if (!error || 
          error?.message?.includes('Auth session missing') ||
          error?.message?.includes('No session') ||
          error?.name === 'AuthSessionMissingError') {
        return; // These are normal, not errors
      }
      
      // Only handle critical JWT corruption/expiration
      if (error?.message?.includes('JWT') && error?.message?.includes('malformed')) {
        event.preventDefault?.();
        console.log('Critical JWT error handled silently');
        
        // Clear corrupted data
        localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
        localStorage.removeItem('secure_session');
        
        // Only redirect if on protected route and no valid user session
        const isOnProtectedRoute = window.location.pathname.includes('/dashboard') || 
                                 window.location.pathname.includes('/profile') ||
                                 window.location.pathname.includes('/admin');
        
        if (isOnProtectedRoute && !loading && !user) {
          navigate('/auth/login', { 
            state: { from: window.location.pathname },
            replace: true 
          });
        }
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