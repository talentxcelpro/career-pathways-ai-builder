
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Lock, 
  Search, 
  Shield, 
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Calendar,
  User,
  Activity,
  Server,
  Database
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const SecurityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('all');

  const securityStats = [
    { label: 'Total Login Attempts', value: '45,678', icon: User, color: 'text-blue-600', change: '+12%' },
    { label: 'Failed Logins', value: '234', icon: AlertTriangle, color: 'text-red-600', change: '-8%' },
    { label: 'Active Sessions', value: '3,456', icon: Activity, color: 'text-green-600', change: '+15%' },
    { label: 'Security Events', value: '89', icon: Shield, color: 'text-purple-600', change: '+3%' }
  ];

  const accessLogs = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      user: 'admin@talentxcel.com',
      action: 'Admin Login',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      status: 'success',
      location: 'Mumbai, India'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:12',
      user: 'john.doe@example.com',
      action: 'Profile Update',
      ipAddress: '103.45.67.89',
      userAgent: 'Firefox 121.0.0.0',
      status: 'success',
      location: 'Delhi, India'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:45',
      user: 'suspicious@email.com',
      action: 'Login Attempt',
      ipAddress: '45.67.89.123',
      userAgent: 'Bot/1.0',
      status: 'blocked',
      location: 'Unknown'
    }
  ];

  const adminActivity = [
    {
      id: '1',
      admin: 'John Doe',
      action: 'Approved employer request #1234',
      timestamp: '2 hours ago',
      category: 'Employer Management'
    },
    {
      id: '2',
      admin: 'Jane Smith',
      action: 'Updated user permissions for user #5678',
      timestamp: '4 hours ago',
      category: 'User Management'
    },
    {
      id: '3',
      admin: 'Mike Johnson',
      action: 'Deleted spam posts (5 items)',
      timestamp: '6 hours ago',
      category: 'Content Moderation'
    }
  ];

  const securityEvents = [
    {
      id: '1',
      type: 'Multiple Failed Logins',
      severity: 'high',
      description: 'User attempted login 5+ times with wrong password',
      timestamp: '1 hour ago',
      resolved: false
    },
    {
      id: '2',
      type: 'Suspicious IP Access',
      severity: 'medium',
      description: 'Access from known proxy/VPN IP range',
      timestamp: '3 hours ago',
      resolved: true
    },
    {
      id: '3',
      type: 'Data Export Request',
      severity: 'low',
      description: 'Large data export requested by admin user',
      timestamp: '5 hours ago',
      resolved: true
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Security & Logs</h1>
              <p className="text-gray-600">View access logs, audit trails, and security settings</p>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                <option value="all">All Logs</option>
                <option value="access">Access Logs</option>
                <option value="security">Security Events</option>
                <option value="admin">Admin Activity</option>
              </select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {securityStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className={`text-sm font-medium ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search logs by user, IP, or action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Access Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Access Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.user}</p>
                              <p className="text-xs text-gray-500">{log.ipAddress}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.action}</p>
                              <p className="text-xs text-gray-500">{log.userAgent}</p>
                            </div>
                          </TableCell>
                          <TableCell>{log.location}</TableCell>
                          <TableCell>
                            <Badge variant={
                              log.status === 'success' ? 'default' :
                              log.status === 'blocked' ? 'destructive' :
                              'secondary'
                            }>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Admin Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Admin Activity Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium">{activity.admin}</span>
                            <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{event.type}</span>
                          <Badge variant={
                            event.severity === 'high' ? 'destructive' :
                            event.severity === 'medium' ? 'secondary' :
                            'default'
                          } className="text-xs">
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{event.timestamp}</span>
                          <Badge variant={event.resolved ? 'default' : 'destructive'} className="text-xs">
                            {event.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Two-Factor Auth
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Password Policy
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Server className="h-4 w-4 mr-2" />
                    IP Whitelist
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Session Management
                  </Button>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Server Uptime</span>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Database Status</span>
                      <span className="font-semibold text-green-600">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="font-semibold">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SSL Certificate</span>
                      <span className="font-semibold text-green-600">Valid</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Force Password Reset
                  </Button>
                  <Button className="w-full" variant="outline">
                    Block IP Address
                  </Button>
                  <Button className="w-full" variant="outline">
                    Clear Failed Attempts
                  </Button>
                  <Button className="w-full" variant="outline">
                    Generate Security Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecurityLogs;
