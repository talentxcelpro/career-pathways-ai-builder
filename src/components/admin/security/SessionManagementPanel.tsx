import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Monitor, Smartphone, Tablet, Globe, Clock, X, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SessionManagementPanel = () => {
  const { 
    userSessions, 
    sessionsLoading, 
    terminateSession,
    terminatingSession
  } = useSecurityManagement();
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = userSessions?.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      session.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      session.profiles?.email?.toLowerCase().includes(searchLower) ||
      session.ip_address?.includes(searchTerm) ||
      session.user_agent?.toLowerCase().includes(searchLower);
  }) || [];

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return Monitor;
    
    const agent = userAgent.toLowerCase();
    if (agent.includes('mobile') || agent.includes('android') || agent.includes('iphone')) {
      return Smartphone;
    } else if (agent.includes('tablet') || agent.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    
    const agent = userAgent.toLowerCase();
    
    // Device type
    let device = 'Desktop';
    if (agent.includes('mobile') || agent.includes('android') || agent.includes('iphone')) {
      device = 'Mobile';
    } else if (agent.includes('tablet') || agent.includes('ipad')) {
      device = 'Tablet';
    }
    
    // Browser
    let browser = 'Unknown';
    if (agent.includes('chrome')) browser = 'Chrome';
    else if (agent.includes('firefox')) browser = 'Firefox';
    else if (agent.includes('safari')) browser = 'Safari';
    else if (agent.includes('edge')) browser = 'Edge';
    else if (agent.includes('opera')) browser = 'Opera';
    
    // OS
    let os = 'Unknown';
    if (agent.includes('windows')) os = 'Windows';
    else if (agent.includes('mac')) os = 'macOS';
    else if (agent.includes('linux')) os = 'Linux';
    else if (agent.includes('android')) os = 'Android';
    else if (agent.includes('ios') || agent.includes('iphone') || agent.includes('ipad')) os = 'iOS';
    
    return { device, browser, os };
  };

  const getLocationString = (locationData: any) => {
    if (!locationData || typeof locationData !== 'object') return 'Unknown Location';
    
    const parts = [];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.region) parts.push(locationData.region);
    if (locationData.country) parts.push(locationData.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  };

  const isRecentActivity = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Active in last 5 minutes
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-500" />
          Active User Sessions ({filteredSessions?.length || 0})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by user, email, IP, or device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {sessionsLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? (
              <>No sessions found matching your search criteria.</>
            ) : (
              <>No active user sessions found.</>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.user_agent);
              const deviceInfo = getDeviceInfo(session.user_agent);
              const isActive = isRecentActivity(session.last_activity_at);
              const isExpiringSoon = new Date(session.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires within 24 hours
              
              return (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="w-6 h-6 text-muted-foreground mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {session.profiles?.full_name || 'Unknown User'}
                          </h3>
                          {isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Active Now
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge variant="outline" className="text-yellow-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {session.profiles?.email || 'No email'}
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            <span>{session.ip_address || 'Unknown IP'}</span>
                            <span>•</span>
                            <span>{getLocationString(session.location_data)}</span>
                          </div>
                          <p>
                            <span className="font-medium">Device:</span> {deviceInfo.device} • 
                            <span className="font-medium"> Browser:</span> {deviceInfo.browser} • 
                            <span className="font-medium"> OS:</span> {deviceInfo.os}
                          </p>
                          <p>
                            <span className="font-medium">Last Activity:</span> {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                          </p>
                          <p>
                            <span className="font-medium">Session Started:</span> {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                          </p>
                          <p>
                            <span className="font-medium">Expires:</span> {new Date(session.expires_at).toLocaleString()}
                          </p>
                        </div>
                        
                        {session.device_info && Object.keys(session.device_info as object).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">Device Details</summary>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                              {JSON.stringify(session.device_info, null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        {session.user_agent && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">User Agent</summary>
                            <p className="text-xs mt-1 p-2 bg-muted rounded break-all">
                              {session.user_agent}
                            </p>
                          </details>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => terminateSession(session.id)}
                        disabled={terminatingSession}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {terminatingSession ? 'Terminating...' : 'Terminate'}
                      </Button>
                    </div>
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