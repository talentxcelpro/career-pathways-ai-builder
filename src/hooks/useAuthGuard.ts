
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export const useAuthGuard = ({
  requireAuth = true,
  redirectTo,
  allowedRoles = []
}: UseAuthGuardOptions = {}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      // Redirect to login with return URL
      navigate(ROUTES.LOGIN, { 
        state: { from: location },
        replace: true 
      });
      return;
    }

    if (!requireAuth && user && redirectTo) {
      // Redirect authenticated users away from auth pages
      navigate(redirectTo, { replace: true });
      return;
    }

    // TODO: Add role-based checks when user roles are implemented
    // if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    //   navigate(ROUTES.DASHBOARD, { replace: true });
    //   return;
    // }
  }, [user, loading, requireAuth, redirectTo, allowedRoles, navigate, location]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    canAccess: !loading && (requireAuth ? !!user : true)
  };
};
