import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: any;
  ip_address: string | null;
  user_agent: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeUsers: number;
}

const SecurityMonitoring = () => {
  const [loading, setLoading] = useState(false);

  // Mock data for display
  const mockEvents: SecurityEvent[] = [
    {
      id: '1',
      user_id: 'user123',
      event_type: 'login_failed',
      description: 'Failed login attempt detected',
      created_at: new Date().toISOString(),
      metadata: { severity: 'medium' },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0...'
    },
    {
      id: '2',
      user_id: 'user456',
      event_type: 'role_escalation_attempt',
      description: 'Unauthorized admin access attempt',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      metadata: { severity: 'critical' },
      ip_address: '10.0.0.25',
      user_agent: 'Mozilla/5.0...'
    }
  ];

  const mockStats: SecurityStats = {
    totalEvents: 45,
    criticalEvents: 2,
    failedLogins: 8,
    suspiciousActivity: 3,
    activeUsers: 156
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getSeverityColor = (event: SecurityEvent) => {
    const severity = (event.metadata as any)?.severity || 'medium';
    return severity === 'critical' ? 'destructive' : 'secondary';
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('login')) return <Users className="h-4 w-4" />;
    if (eventType.includes('permission') || eventType.includes('role')) return <Lock className="h-4 w-4" />;
    if (eventType.includes('rate_limit')) return <AlertTriangle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <UnifiedAdminLayout 
      title="Security Monitoring" 
      description="Real-time security event monitoring and analysis"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Security Monitoring</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Security Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Events Today</div>
              </div>
              <div className="text-2xl font-bold">{mockStats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="text-sm font-medium text-muted-foreground">Critical Events</div>
              </div>
              <div className="text-2xl font-bold text-red-500">{mockStats.criticalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Failed Logins</div>
              </div>
              <div className="text-2xl font-bold text-orange-500">{mockStats.failedLogins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-yellow-500" />
                <div className="text-sm font-medium text-muted-foreground">Suspicious Activity</div>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{mockStats.suspiciousActivity}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <div className="text-sm font-medium text-muted-foreground">Active Users</div>
              </div>
              <div className="text-2xl font-bold text-green-500">{mockStats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Security Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{event.event_type.replace(/_/g, ' ')}</span>
                      <Badge variant={getSeverityColor(event)} className="text-xs">
                        {(event.metadata as any)?.severity || 'medium'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{formatEventTime(event.created_at)}</span>
                      {event.user_id && (
                        <span>User: {event.user_id.substring(0, 8)}...</span>
                      )}
                      {event.ip_address && (
                        <span>IP: {event.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default SecurityMonitoring;