import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, Users, Eye } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: any;
  user_id?: string;
  severity?: string;
}

interface SecurityMetrics {
  activeUsers: number;
  securityEvents: number;
  failedLogins: number;
  alertsToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const RealTimeSecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    securityEvents: 0,
    failedLogins: 0,
    alertsToday: 0,
    systemHealth: 'healthy'
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    fetchSecurityEvents();
    fetchMetrics();
    
    if (isMonitoring) {
      const channel = supabase
        .channel('security-monitor')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'security_events' },
          (payload) => {
            const newEvent = payload.new as SecurityEvent;
            setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
            
            // Update metrics on new security event
            setMetrics(prev => ({
              ...prev,
              securityEvents: prev.securityEvents + 1,
              alertsToday: prev.alertsToday + 1
            }));
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'admin_activity_log' },
          () => {
            fetchMetrics(); // Refresh metrics on admin activity
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isMonitoring]);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [securityEventsResult, activeUsersResult] = await Promise.all([
        supabase
          .from('security_events')
          .select('event_type, created_at')
          .gte('created_at', today),
        supabase
          .from('profiles')
          .select('is_online')
          .eq('is_online', true)
      ]);

      const securityEvents = securityEventsResult.data || [];
      const activeUsers = activeUsersResult.data?.length || 0;
      const failedLogins = securityEvents.filter(e => 
        e.event_type.includes('failed') || e.event_type.includes('login_failed')
      ).length;

      const systemHealth = failedLogins > 10 ? 'critical' : 
                          failedLogins > 5 ? 'warning' : 'healthy';

      setMetrics({
        activeUsers,
        securityEvents: securityEvents.length,
        failedLogins,
        alertsToday: securityEvents.filter(e => 
          e.event_type.includes('alert') || e.event_type.includes('warning')
        ).length,
        systemHealth
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthIcon = () => {
    switch (metrics.systemHealth) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Real-Time Security Monitor</h2>
        </div>
        <Button
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? "destructive" : "default"}
        >
          <Activity className="h-4 w-4 mr-2" />
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
      </div>

      {/* Security Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.systemHealth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.securityEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Live Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No security events detected
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event_type}</span>
                      <Badge variant={getSeverityColor(event.metadata?.severity)}>
                        {event.metadata?.severity || 'info'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status Alerts */}
      {metrics.systemHealth !== 'healthy' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.systemHealth === 'critical' 
              ? `Critical security alert: ${metrics.failedLogins} failed login attempts detected today.`
              : `Warning: Increased security activity detected. Monitor for potential threats.`
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};