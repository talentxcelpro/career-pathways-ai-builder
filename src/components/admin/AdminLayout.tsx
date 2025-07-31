
import React from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Loader } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Checking Access</h2>
            <p className="text-muted-foreground">Verifying admin permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin area.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
