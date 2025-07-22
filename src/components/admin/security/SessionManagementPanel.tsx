import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Monitor, Smartphone, Laptop, Globe, LogOut, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SessionManagementPanel = () => {
  const { userSessions, sessionsLoading, terminateSession } = useSecurityManagement();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = userSessions?.filter(session => {
    const matchesSearch = !searchTerm || 
      (typeof session.profiles === 'object' && session.profiles && 'full_name' in session.profiles && (session.profiles as any).full_name && (session.profiles as any).full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof session.profiles === 'object' && session.profiles && 'email' in session.profiles && (session.profiles as any).email && (session.profiles as any).email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof session.user_agent === 'string' && session.user_agent.includes(searchTerm));
    
    return matchesSearch;
  }) || [];

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent || typeof userAgent !== 'string') return Monitor;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return Smartphone;
    }
    return Laptop;
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent || typeof userAgent !== 'string') return 'Unknown Device';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile Device';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  const getBrowser = (userAgent: string) => {
    if (!userAgent || typeof userAgent !== 'string') return 'Unknown Browser';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Other Browser';
  };

  if (sessionsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-500" />
          Active User Sessions ({filteredSessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search">Search Sessions</Label>
          <Input
            id="search"
            placeholder="Search by user name, email, or device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.user_agent as string);
              
              return (
                <div key={session.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {(typeof session.profiles === 'object' && session.profiles && 'full_name' in session.profiles && (session.profiles as any).full_name) || 'Unknown User'}
                          </h4>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(typeof session.profiles === 'object' && session.profiles && 'email' in session.profiles && (session.profiles as any).email) || 'No email'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{getDeviceType(session.user_agent as string)}</span>
                          <span>•</span>
                          <span>{getBrowser(session.user_agent as string)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{String(session.user_agent || 'Unknown')}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {String(session.ip_address || 'Unknown IP')}
                          </div>
                          {typeof session.location_data === 'object' && session.location_data && (
                            <span>📍 Location data available</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>
                            Started: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span>
                            Last activity: {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => terminateSession(session.id)}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Terminate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};