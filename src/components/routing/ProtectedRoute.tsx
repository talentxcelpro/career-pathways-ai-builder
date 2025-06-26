
import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  return (
    <AuthGuard requiredRoles={requiredRoles}>
      {children}
    </AuthGuard>
  );
};
