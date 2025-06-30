
import React from 'react';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployerAccessGuardProps {
  children: React.ReactNode;
}

export const EmployerAccessGuard: React.FC<EmployerAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasEmployerAccess, isLoading, employerStatus } = useEmployerAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please login to access employer features</p>
            <Button onClick={() => navigate('/auth/login')}>
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasEmployerAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Employer Access Required</h2>
            <p className="text-gray-600 mb-4">
              {employerStatus === 'pending' 
                ? 'Your employer access request is pending approval.' 
                : employerStatus === 'rejected'
                ? 'Your employer access request was rejected.'
                : 'You need to be an approved employer to access this feature.'
              }
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/employer/request-access')}>
                {employerStatus === 'pending' ? 'Check Status' : 'Request Access'}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
