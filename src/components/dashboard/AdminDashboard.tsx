import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  Database,
  Activity,
  BarChart3,
  UserCheck,
  FileText,
  Building2,
  School
} from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform health, manage users, and oversee system operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">12,847</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">234</div>
                <div className="text-xs text-muted-foreground">Companies</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <School className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">89</div>
                <div className="text-xs text-muted-foreground">Colleges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">98.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">User Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">System Settings</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Database className="h-6 w-6" />
                  <span className="text-sm">Database</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Security</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New company registration</p>
                    <p className="text-xs text-muted-foreground">TechCorp Solutions joined the platform</p>
                  </div>
                  <Badge variant="secondary">5 min ago</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <School className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">College verification completed</p>
                    <p className="text-xs text-muted-foreground">IIT Delhi profile approved</p>
                  </div>
                  <Badge variant="secondary">1 hour ago</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-muted-foreground">Database optimization at 2:00 AM</p>
                  </div>
                  <Badge variant="secondary">2 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Status</span>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Performance</span>
                <Badge className="bg-yellow-500">Slow</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Security</span>
                <Badge className="bg-green-500">Secure</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Daily Active Users</span>
                <span className="font-medium">3,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Registrations</span>
                <span className="font-medium">142</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jobs Posted</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Applications</span>
                <span className="font-medium">1,234</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Warning</Badge>
                  <span className="text-sm font-medium">High CPU Usage</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Server load at 87% - consider scaling
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="text-xs">Error</Badge>
                  <span className="text-sm font-medium">Failed Backups</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Database backup failed twice
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}