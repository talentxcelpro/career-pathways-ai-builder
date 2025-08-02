import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock,
  Eye,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true);

      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_events')
        .select(`
          id,
          user_id,
          event_type,
          description,
          created_at,
          metadata,
          ip_address,
          user_agent
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) {
        console.error('Error fetching security events:', eventsError);
        toast.error('Failed to load security events');
        return;
      }

      // Type-safe event handling
      const typedEvents = (events || []).map(event => ({
        ...event,
        metadata: event.metadata as Record<string, any> || {},
        ip_address: event.ip_address as string | null
      }));

      setSecurityEvents(typedEvents);

      // Calculate security statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEvents = typedEvents.filter(event => 
        new Date(event.created_at) >= today
      );

      const criticalEvents = todayEvents.filter(event => 
        (event.metadata as any)?.severity === 'critical' ||
        event.event_type.includes('failed') ||
        event.event_type.includes('blocked') ||
        event.event_type.includes('violation')
      );

      const failedLogins = todayEvents.filter(event => 
        event.event_type === 'login_failed' ||
        event.event_type === 'login_validation_failed'
      );

      const suspiciousActivity = todayEvents.filter(event => 
        event.event_type.includes('rate_limit') ||
        event.event_type.includes('invalid_role') ||
        event.event_type.includes('unauthorized')
      );

      // Get active users count (users who logged in today)
      const activeUsersToday = new Set(
        todayEvents
          .filter(event => event.event_type === 'login_success')
          .map(event => event.user_id)
      ).size;

      setStats({
        totalEvents: todayEvents.length,
        criticalEvents: criticalEvents.length,
        failedLogins: failedLogins.length,
        suspiciousActivity: suspiciousActivity.length,
        activeUsers: activeUsersToday
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security monitoring data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time subscription for security events
    const channel = supabase
      .channel('security_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        (payload) => {
          const newEvent = {
            ...payload.new,
            metadata: payload.new.metadata as Record<string, any> || {},
            ip_address: payload.new.ip_address as string | null
          } as SecurityEvent;
          setSecurityEvents(prev => [newEvent, ...prev.slice(0, 49)]);
          fetchSecurityData(); // Refresh stats
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getSeverityColor = (event: SecurityEvent) => {
    const severity = (event.metadata as any)?.severity || 'medium';
    const eventType = event.event_type;

    if (severity === 'critical' || eventType.includes('system_error')) {
      return 'destructive';
    }
    if (severity === 'high' || eventType.includes('failed') || eventType.includes('blocked')) {
      return 'destructive';
    }
    if (severity === 'medium' || eventType.includes('rate_limit')) {
      return 'secondary';
    }
    return 'outline';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Security Monitoring</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Security Monitoring</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSecurityData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="text-sm font-medium text-muted-foreground">Critical Events</div>
            </div>
            <div className="text-2xl font-bold text-red-500">{stats.criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium text-muted-foreground">Failed Logins</div>
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.failedLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <div className="text-sm font-medium text-muted-foreground">Suspicious Activity</div>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stats.suspiciousActivity}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium text-muted-foreground">Active Users</div>
            </div>
            <div className="text-2xl font-bold text-green-500">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {stats.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.criticalEvents} critical security event(s) detected today. Please review immediately.
          </AlertDescription>
        </Alert>
      )}

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
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No security events found
              </div>
            ) : (
              securityEvents.map((event) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;