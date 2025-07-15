import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface EnterpriseGuardProps {
  children: React.ReactNode;
}

export const EnterpriseGuard: React.FC<EnterpriseGuardProps> = ({ children }) => {
  const { user } = useAuth();
  
  // For now, allow access for authenticated users
  // TODO: Add enterprise permission check
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to access enterprise features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};