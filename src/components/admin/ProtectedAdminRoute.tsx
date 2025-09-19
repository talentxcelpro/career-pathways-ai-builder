import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { AdminPermissions } from '@/types/admin';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof AdminPermissions;
  fallbackPath?: string;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/auth'
}) => {
  const { isLoading, isAdmin, hasPermission } = useAdminPermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to:', fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('Missing required permission:', requiredPermission, 'redirecting to main admin');
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};