import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import CareerDashboard from './CareerDashboard';

export default function UnifiedCommandCenter() {
  const { user, loading: authLoading } = useAuth();
  const { CommandCenterType, isLoading: roleLoading } = useUserRole();

  // Show loading state while determining user role
  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render the unified Command Center. Role-specific shells were removed from
  // the codebase, so this page now routes every authenticated role through the
  // maintained TalentXcel dashboard surface.
  const renderCommandCenter = () => {
    switch (CommandCenterType) {
      case 'admin':
      case 'employer':
      case 'college_admin':
      case 'student':
      default:
        return <CareerDashboard />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {renderCommandCenter()}
    </div>
  );
}

