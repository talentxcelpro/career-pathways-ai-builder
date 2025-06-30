
import React from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { AdminLayout } from './AdminLayout';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof import('@/types/admin').AdminPermissions;
  fallback?: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  requiredPermission,
  fallback 
}) => {
  const { hasPermission, isAdmin, isLoading } = useAdminPermissions();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access the admin area.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Insufficient Permissions</h2>
              <p className="text-gray-600">You don't have permission to access this module.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return <>{children}</>;
};
