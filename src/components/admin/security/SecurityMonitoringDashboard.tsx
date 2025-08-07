import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Database,
  Lock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SecurityMetrics {
  totalSecurityEvents: number;
  criticalAlerts: number;
  failedLogins: number;
  suspiciousActivity: number;
  adminActions: number;
  roleChanges: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: any;
  user_id: string;
  ip_address: string | null;
}

export const SecurityMonitoringDashboard = () => {
  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const [
        { count: totalEvents },
        { count: criticalAlerts },
        { count: failedLogins },
        { count: suspiciousActivity },
        { count: adminActions },
        { count: roleChanges }
      ] = await Promise.all([
        supabase.from('security_events').select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString()),
        supabase.from('security_events').select('*', { count: 'exact', head: true })
          .contains('metadata', { severity: 'critical' })
          .gte('created_at', yesterday.toISOString()),
        supabase.from('security_events').select('*', { count: 'exact', head: true })
          .eq('event_type', 'login_failed')
          .gte('created_at', yesterday.toISOString()),
        supabase.from('security_events').select('*', { count: 'exact', head: true })
          .in('event_type', ['admin_operation_denied', 'privilege_escalation_attempt'])
          .gte('created_at', yesterday.toISOString()),
        supabase.from('admin_activity_log').select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString()),
        supabase.from('admin_activity_log').select('*', { count: 'exact', head: true })
          .eq('action_type', 'role_assignment')
          .gte('created_at', yesterday.toISOString())
      ]);

      return {
        totalSecurityEvents: totalEvents || 0,
        criticalAlerts: criticalAlerts || 0,
        failedLogins: failedLogins || 0,
        suspiciousActivity: suspiciousActivity || 0,
        adminActions: adminActions || 0,
        roleChanges: roleChanges || 0
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent security events
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-security-events'],
    queryFn: async (): Promise<SecurityEvent[]> => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data as SecurityEvent[]) || [];
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const getSeverityColor = (event: SecurityEvent) => {
    const severity = event.metadata?.severity || 'medium';
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('admin')) return <Shield className="h-4 w-4" />;
    if (eventType.includes('failed') || eventType.includes('denied')) return <AlertTriangle className="h-4 w-4" />;
    if (eventType.includes('role')) return <Users className="h-4 w-4" />;
    if (eventType.includes('login')) return <Lock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSecurityEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total security events logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Authentication failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.suspiciousActivity || 0}</div>
            <p className="text-xs text-muted-foreground">
              Potential security threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.adminActions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Administrative operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.roleChanges || 0}</div>
            <p className="text-xs text-muted-foreground">
              User role modifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {metrics?.criticalAlerts && metrics.criticalAlerts > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Security Alert:</strong> {metrics.criticalAlerts} critical security events 
            detected in the last 24 hours. Immediate review recommended.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Real-time monitoring of security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded flex-1"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <div className="font-medium text-sm">{event.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.event_type} • {event.ip_address || 'Unknown IP'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event) as any}>
                        {event.metadata?.severity || 'medium'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No security events found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};