import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, LogOut, RefreshCw } from 'lucide-react';
import { useSecureSessionContext } from './SecureSessionProvider';

export const SessionStatus: React.FC = () => {
  const { session, logout, refreshSession, isAuthenticated } = useSecureSessionContext();

  if (!isAuthenticated || !session) {
    return null;
  }

  const timeUntilExpiry = new Date(session.expires_at).getTime() - Date.now();
  const minutesLeft = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60)));

  const getStatusColor = () => {
    if (minutesLeft > 10) return 'bg-green-500';
    if (minutesLeft > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleRefresh = async () => {
    await refreshSession();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Session Status
        </CardTitle>
        <CardDescription>
          Your secure session information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            Active
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Expires in:</span>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            {minutesLeft} minutes
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">User:</span>
          <span className="text-sm text-muted-foreground">
            {session.user?.email}
          </span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
        
        {minutesLeft <= 5 && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Session expires soon. Click refresh to extend.
          </div>
        )}
      </CardContent>
    </Card>
  );
};