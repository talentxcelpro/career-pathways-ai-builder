import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnhancedAuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
  requiresVerification?: boolean;
  allowedRoles?: string[];
  showFallback?: boolean;
}

/**
 * Enhanced authentication guard that integrates with RLS policies
 * Provides comprehensive auth checking, role validation, and proper fallbacks
 */
export const EnhancedAuthGuard: React.FC<EnhancedAuthGuardProps> = ({
  children,
  fallbackPath = '/auth/login',
  requiresVerification = false,
  allowedRoles,
  showFallback = true,
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // No user or session - redirect to login
  if (!user || !session) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${fallbackPath}?returnUrl=${returnUrl}`} replace />;
  }

  // Session validation
  if (session) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      if (expiresAt && now >= expiresAt) {
        console.log('Session expired in EnhancedAuthGuard');
        localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
        localStorage.removeItem('secure_session');
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`${fallbackPath}?returnUrl=${returnUrl}&reason=expired`} replace />;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`${fallbackPath}?returnUrl=${returnUrl}&reason=error`} replace />;
    }
  }

  // Email verification check
  if (requiresVerification && !user.email_confirmed_at) {
    if (showFallback) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Email Verification Required</CardTitle>
              <CardDescription>
                Please verify your email address to access this feature.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We've sent a verification email to <strong>{user.email}</strong>. 
                Please check your inbox and click the verification link.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="flex-1"
                >
                  Sign In Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <Navigate to="/auth/verify-email" replace />;
  }

  // Role-based access control (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    // This would require checking user roles from the database
    // For now, we'll implement a basic version
    const userRole = user.user_metadata?.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      if (showFallback) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this resource.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};