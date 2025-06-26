
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ROUTES } from '@/constants/routes';

interface PublicOnlyGuardProps {
  children: React.ReactNode;
}

export const PublicOnlyGuard: React.FC<PublicOnlyGuardProps> = ({ children }) => {
  const { user, loading } = useAuthGuard({
    requireAuth: false,
    redirectTo: ROUTES.DASHBOARD
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
