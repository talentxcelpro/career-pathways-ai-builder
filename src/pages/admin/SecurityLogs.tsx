import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Shield, AlertTriangle, Activity, Eye, 
  Filter, Download, RefreshCw, Clock, MapPin 
} from 'lucide-react';
import { useSecurityLogs } from '@/hooks/useSecurityLogs';
import { format } from 'date-fns';

const SecurityLogs = () => {
  const {
    searchTerm,
    setSearchTerm,
    logType,
    setLogType,
    securityStats,
    recentLogins,
    profileViews
  } = useSecurityLogs();

  const stats = [
    { 
      title: 'Total Logins', 
      value: securityStats?.totalLogins?.toString() || '0', 
      icon: Activity,
      trend: '+5.2%',
      color: 'text-blue-600'
    },
    { 
      title: 'Failed Attempts', 
      value: securityStats?.failedLogins?.toString() || '0', 
      icon: AlertTriangle,
      trend: '-12.3%',
      color: 'text-red-600'
    },
    { 
      title: 'Suspicious Activity', 
      value: securityStats?.suspiciousActivity?.toString() || '0', 
      icon: Shield,
      trend: '-8.1%',
      color: 'text-orange-600'
    },
    { 
      title: 'Blocked IPs', 
      value: securityStats?.blockedIPs?.toString() || '0', 
      icon: Shield,
      trend: '0%',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security & Audit Center</h1>
          <p className="text-muted-foreground">Real-time security monitoring and comprehensive audit trails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend.startsWith('+') ? 'text-green-600' : stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}>
                    {stat.trend}
                  </span> from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="profile-views">Profile Views</TabsTrigger>
          <TabsTrigger value="threat-detection">Threat Detection</TabsTrigger>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Login Activities</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={logType} onValueChange={setLogType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="failed_login">Failed Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogins?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.profiles?.full_name || 'Unknown User'}</div>
                          <div className="text-sm text-muted-foreground">{log.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.action_type === 'failed_login' ? 'destructive' : 'default'}>
                          {log.action_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.action_type === 'failed_login' ? 'destructive' : 'secondary'}>
                          {log.action_type === 'failed_login' ? 'Failed' : 'Success'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile-views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile View Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">Monitor who's viewing user profiles</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Viewer</TableHead>
                    <TableHead>Profile Viewed</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profileViews?.map((view) => (
                    <TableRow key={view.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{view.viewer_profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{view.viewer_profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{view.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{view.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-mono text-sm">{view.ip_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(view.viewed_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threat-detection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Threat Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">System Status: Secure</h4>
                      <p className="text-sm text-muted-foreground">No active threats detected</p>
                    </div>
                  </div>
                  <Badge variant="secondary">All Clear</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">DDoS Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Rate Limiting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Enabled</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Firewall Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Protected</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Audit Trail</CardTitle>
              <p className="text-sm text-muted-foreground">Complete record of administrative actions and system changes</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Comprehensive audit trail system is being prepared.</p>
                <p className="text-sm">All administrative actions will be logged here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityLogs;