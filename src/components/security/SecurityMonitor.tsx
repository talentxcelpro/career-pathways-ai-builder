import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Activity, Lock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetric {
  event_hour: string;
  event_type: string;
  event_count: number;
  affected_users: number;
  unique_ips: number;
  avg_threat_score: number;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  blockedAttempts: number;
  activeThreats: number;
}

export const SecurityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    blockedAttempts: 0,
    activeThreats: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchSecurityData = async () => {
    try {
      // Get security dashboard metrics
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('security_dashboard_view')
        .select('*')
        .order('event_hour', { ascending: false })
        .limit(24);

      if (dashboardError) {
        console.error('Dashboard error:', dashboardError);
        toast({
          title: "Error Loading Security Data",
          description: "Failed to load security dashboard metrics.",
          variant: "destructive",
        });
        return;
      }

      setMetrics(dashboardData || []);

      // Calculate summary stats
      const now = new Date();
      const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      const { data: recentEvents, error: eventsError } = await supabase
        .from('security_events')
        .select('event_type, metadata')
        .gte('created_at', last24Hours.toISOString());

      if (eventsError) {
        console.error('Events error:', eventsError);
        return;
      }

      const totalEvents = recentEvents?.length || 0;
      const criticalEvents = recentEvents?.filter(event => 
        event.metadata?.severity === 'critical' || 
        event.metadata?.threat_score >= 8
      ).length || 0;
      const blockedAttempts = recentEvents?.filter(event => 
        event.event_type.includes('blocked') || 
        event.event_type.includes('rate_limit')
      ).length || 0;

      // Get active rate limits (as proxy for active threats)
      const { data: activeLimits, error: limitsError } = await supabase
        .from('security_rate_limits')
        .select('*')
        .gt('blocked_until', new Date().toISOString());

      const activeThreats = activeLimits?.length || 0;

      setStats({
        totalEvents,
        criticalEvents,
        blockedAttempts,
        activeThreats
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Security Monitor Error",
        description: "Failed to fetch security monitoring data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getSeverityColor = (avgThreatScore: number) => {
    if (avgThreatScore >= 8) return 'destructive';
    if (avgThreatScore >= 5) return 'secondary';
    return 'default';
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('auth')) return <Lock className="h-4 w-4" />;
    if (eventType.includes('admin') || eventType.includes('role')) return <Users className="h-4 w-4" />;
    if (eventType.includes('block') || eventType.includes('rate')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events (24h)</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Attempts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.blockedAttempts}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeThreats}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {stats.criticalEvents > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> {stats.criticalEvents} critical security event(s) detected in the last 24 hours. 
            Review the security logs immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Events (Last 24 Hours)
            </CardTitle>
            <CardDescription>
              Real-time security monitoring and threat detection
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSecurityData}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events in the last 24 hours</p>
              <p className="text-sm">Your system is secure</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEventTypeIcon(metric.event_type)}
                    <div>
                      <p className="font-medium">{metric.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metric.event_hour).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{metric.event_count}</p>
                      <p className="text-xs text-muted-foreground">Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{metric.affected_users}</p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{metric.unique_ips}</p>
                      <p className="text-xs text-muted-foreground">IPs</p>
                    </div>
                    <Badge variant={getSeverityColor(metric.avg_threat_score)}>
                      Threat: {metric.avg_threat_score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};