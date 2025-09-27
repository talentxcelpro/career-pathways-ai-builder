import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  Eye, 
  Activity, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  UserX,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

interface AdminActivity {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action_type: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}

interface SessionInfo {
  user_id: string;
  last_sign_in_at: string;
  sign_in_count: number;
  current_sign_in_ip: string | null;
  last_sign_in_ip: string | null;
}

interface SecurityStats {
  totalEvents: number;
  suspiciousEvents: number;
  failedLogins: number;
  activeSessions: number;
}

/**
 * Security Center for Phase 3: Advanced security monitoring and audit logging
 * Tracks all security events, admin activities, and user sessions
 */
export const SecurityCenter: React.FC = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('24h');
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    suspiciousEvents: 0,
    failedLogins: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    fetchSecurityData();
  }, [timeRangeFilter]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range
      const now = new Date();
      let startTime = new Date();
      switch (timeRangeFilter) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
        default:
          startTime.setDate(now.getDate() - 1);
      }

      // Fetch security events
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) {
        console.error('Error fetching security events:', eventsError);
      } else {
        setSecurityEvents(eventsData || []);
      }

      // Fetch admin activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('admin_activity_log')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) {
        console.error('Error fetching admin activities:', activitiesError);
      } else {
        setAdminActivities(activitiesData || []);
      }

      // Calculate security stats
      const events = eventsData || [];
      const stats: SecurityStats = {
        totalEvents: events.length,
        suspiciousEvents: events.filter(e => 
          e.event_type.includes('failed') || 
          e.event_type.includes('blocked') || 
          e.event_type.includes('violation')
        ).length,
        failedLogins: events.filter(e => e.event_type === 'failed_login').length,
        activeSessions: events.filter(e => e.event_type === 'login').length,
      };
      setSecurityStats(stats);

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (eventType: string, description: string, targetUserId?: string) => {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: targetUserId || user?.id,
          event_type: eventType,
          description,
          ip_address: null, // Would be populated by server
          metadata: {
            admin_initiated: true,
            timestamp: new Date().toISOString(),
          },
        });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      // Deactivate all user roles
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('Error blocking user:', error);
        toast.error('Failed to block user');
        return;
      }

      await logSecurityEvent('user_blocked', `User blocked by admin`, userId);
      toast.success('User blocked successfully');
      fetchSecurityData();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const exportSecurityLog = () => {
    const data = securityEvents.map(event => ({
      timestamp: event.created_at,
      user_id: event.user_id,
      event_type: event.event_type,
      description: event.description,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
    }));

    const csv = [
      ['Timestamp', 'User ID', 'Event Type', 'Description', 'IP Address', 'User Agent'],
      ...data.map(row => [
        row.timestamp,
        row.user_id,
        row.event_type,
        row.description,
        row.ip_address || '',
        row.user_agent || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login')) return <Lock className="h-4 w-4" />;
    if (eventType.includes('failed')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (eventType.includes('blocked')) return <UserX className="h-4 w-4 text-red-500" />;
    if (eventType.includes('admin')) return <Shield className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4" />;
  };

  const getEventTypeBadge = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('blocked')) {
      return <Badge variant="destructive">{eventType}</Badge>;
    }
    if (eventType.includes('admin') || eventType.includes('role')) {
      return <Badge variant="default">{eventType}</Badge>;
    }
    return <Badge variant="secondary">{eventType}</Badge>;
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user_id.includes(searchTerm);
    
    const matchesEventType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    
    return matchesSearch && matchesEventType;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Security Center
          </h1>
          <p className="text-muted-foreground">
            Phase 3: Advanced security monitoring, audit logging, and threat detection
          </p>
        </div>

        {/* Security Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeRangeFilter}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{securityStats.suspiciousEvents}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <Lock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{securityStats.failedLogins}</div>
              <p className="text-xs text-muted-foreground">
                Authentication failures
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{securityStats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Current logins
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Monitoring Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="admin">Admin Activities</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Security Event Monitor</CardTitle>
                <CardDescription>
                  Real-time security events and threat detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events by description, type, or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="failed_login">Failed Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="role_change">Role Change</SelectItem>
                      <SelectItem value="admin_action">Admin Action</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchSecurityData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={exportSecurityLog} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">Loading security events...</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.event_type)}
                              {getEventTypeBadge(event.event_type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {event.user_id?.slice(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md truncate">{event.description}</div>
                          </TableCell>
                          <TableCell>
                            {event.ip_address || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {event.event_type.includes('failed') || event.event_type.includes('blocked') ? (
                              <Badge variant="destructive">High</Badge>
                            ) : event.event_type.includes('admin') ? (
                              <Badge variant="default">Medium</Badge>
                            ) : (
                              <Badge variant="secondary">Low</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Log</CardTitle>
                <CardDescription>
                  Track all administrative actions and changes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin User</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {new Date(activity.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {activity.admin_user_id?.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{activity.action_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {activity.target_user_id ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {activity.target_user_id.slice(0, 8)}...
                            </code>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">
                            {JSON.stringify(activity.details)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Monitor current user sessions and authentication status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Session Monitoring</h3>
                  <p className="text-muted-foreground">
                    Real-time session tracking is available with enhanced authentication logging.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};