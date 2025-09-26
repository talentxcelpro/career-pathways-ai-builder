import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Mock admin check - in production, this would check user roles from database
  const isAdmin = user?.email?.includes('admin') || user?.id === 'admin-user-id';

  if (!isAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard. 
              Please contact your system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
};