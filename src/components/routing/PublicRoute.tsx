
import React from 'react';
import { PublicOnlyGuard } from '@/components/auth/PublicOnlyGuard';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return (
    <PublicOnlyGuard>
      {children}
    </PublicOnlyGuard>
  );
};
