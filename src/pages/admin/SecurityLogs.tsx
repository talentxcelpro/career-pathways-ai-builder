
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  Lock, 
  Activity,
  Eye,
  Download,
  Filter,
  Ban
} from 'lucide-react';
import { useSecurityLogs } from '@/hooks/useSecurityLogs';

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

  const statsCards = [
    { label: 'Total Logins', value: securityStats?.totalLogins || 0, icon: Activity, color: 'text-blue-600' },
    { label: 'Failed Logins', value: securityStats?.failedLogins || 0, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Suspicious Activity', value: securityStats?.suspiciousActivity || 0, icon: Shield, color: 'text-yellow-600' },
    { label: 'Blocked IPs', value: securityStats?.blockedIPs || 0, icon: Ban, color: 'text-gray-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Security & Logs" 
      description="Monitor security events, user activity, and audit trails"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user, email, or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="logins">Login Events</SelectItem>
                  <SelectItem value="views">Profile Views</SelectItem>
                  <SelectItem value="security">Security Events</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Login Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Login Method</TableHead>
                      <TableHead>Login Count</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogins?.map((login) => (
                      <TableRow key={login.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {login.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{login.full_name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-600">{login.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {login.provider || 'email'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{login.login_count || 0} times</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {login.last_login_at 
                              ? new Date(login.last_login_at).toLocaleString()
                              : 'Never'
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Profile View Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Profile View Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileViews?.slice(0, 10).map((view) => (
                    <div key={view.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {view.viewer?.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">
                          {view.viewer ? view.viewer.full_name : 'Anonymous'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        Viewed {view.profiles?.full_name || 'Unknown User'}'s profile
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(view.viewed_at).toLocaleString()}
                        </span>
                        {view.ip_address && (
                          <Badge variant="outline" className="text-xs">
                            {String(view.ip_address)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Block IP Address
                </Button>
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Security Alert
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Audit Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default SecurityLogs;
