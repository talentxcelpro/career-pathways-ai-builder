import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { ComingSoonPage } from './ComingSoonPage';

interface PublicAccessGuardProps {
  children: React.ReactNode;
  requiresAdminAccess?: boolean;
  isPublic?: boolean;
}

export const PublicAccessGuard: React.FC<PublicAccessGuardProps> = ({ 
  children, 
  requiresAdminAccess = false,
  isPublic = false 
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading } = useAdminAccess();
  const location = useLocation();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If route requires admin access
  if (requiresAdminAccess) {
    if (!user) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (!isAdmin) {
      return <ComingSoonPage feature="This Feature" />;
    }
    return <>{children}</>;
  }

  // If route is public, allow access regardless of auth status
  if (isPublic) {
    return <>{children}</>;
  }

  // If route is not public and user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};