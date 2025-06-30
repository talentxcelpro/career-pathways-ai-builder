
import React from 'react';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const EmployerStatusDebug: React.FC = () => {
  const { user } = useAuth();
  const { isEmployer, isApproved, hasEmployerAccess, employerStatus, isLoading } = useEmployerAccess();

  if (!user) return null;

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Employer Status Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">User ID:</span>
          <span className="text-xs font-mono">{user.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Loading:</span>
          <Badge variant={isLoading ? "default" : "secondary"}>
            {isLoading ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Is Employer:</span>
          <Badge variant={isEmployer ? "default" : "secondary"}>
            {isEmployer ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Status:</span>
          <Badge variant={employerStatus === 'approved' ? "default" : "secondary"}>
            {employerStatus || "None"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Has Access:</span>
          <Badge variant={hasEmployerAccess ? "default" : "destructive"}>
            {hasEmployerAccess ? "Yes" : "No"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
