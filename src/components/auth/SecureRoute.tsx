import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSecureSessionContext } from './SecureSessionProvider';
import { Loader2 } from 'lucide-react';

interface SecureRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export const SecureRoute: React.FC<SecureRouteProps> = ({ 
  children, 
  fallbackPath = '/secure-login' 
}) => {
  const { isAuthenticated, isLoading } = useSecureSessionContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};