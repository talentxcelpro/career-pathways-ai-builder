import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Shield, AlertTriangle, Lock, Eye, Users, Activity } from 'lucide-react';

export const SecurityDashboard = () => {
  const { securityStats, statsLoading } = useSecurityManagement();

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Security Events',
      value: securityStats?.totalEvents || 0,
      icon: Shield,
      description: 'Total security events logged',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Failed Logins',
      value: securityStats?.failedLogins || 0,
      icon: Lock,
      description: 'Failed login attempts',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950'
    },
    {
      title: 'Blocked IPs',
      value: securityStats?.blockedIPs || 0,
      icon: AlertTriangle,
      description: 'Currently blocked IP addresses',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Suspended Accounts',
      value: securityStats?.suspendedAccounts || 0,
      icon: Users,
      description: 'Currently suspended user accounts',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
    {
      title: 'Active Sessions',
      value: securityStats?.activeSessions || 0,
      icon: Activity,
      description: 'Currently active user sessions',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Pending Alerts',
      value: securityStats?.pendingAlerts || 0,
      icon: Eye,
      description: 'Unacknowledged security alerts',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Security Dashboard</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            All Systems Operational
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isAlert = stat.value > 0 && (stat.title === 'Failed Logins' || stat.title === 'Pending Alerts' || stat.title === 'Blocked IPs');
          
          return (
            <Card key={index} className={`${isAlert ? 'border-destructive/20' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-md`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {isAlert && (
                    <Badge variant="destructive" className="animate-pulse">
                      Alert
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              View Security Events
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Manage IP Blocks
            </Button>
            <Button variant="outline" size="sm">
              <Lock className="w-4 h-4 mr-2" />
              Review Failed Logins
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Monitor Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};