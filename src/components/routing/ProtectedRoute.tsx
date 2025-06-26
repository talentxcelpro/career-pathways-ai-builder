
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/routes';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = ROUTES.LOGIN 
}: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        // Get user role from profile or metadata - using user_role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.user_role || 'user');
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        // Get user role from profile or metadata
        supabase
          .from('profiles')
          .select('user_role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserRole(profile?.user_role || 'user');
          });
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
