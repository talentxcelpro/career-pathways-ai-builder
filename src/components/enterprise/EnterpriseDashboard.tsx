import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield, BarChart3, Settings, UserPlus, ShieldCheck, Megaphone, Activity, TrendingUp, Database } from 'lucide-react';
import { useOrganizationData } from '@/hooks/useOrganization';
import { EnterpriseDataService } from '@/services/enterpriseDataService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DepartmentManagement } from './DepartmentManagement';
import { MarketingDashboard } from './MarketingDashboard';
import { LiveReporting } from './LiveReporting';

interface DashboardMetrics {
  totalUsers: number;
  departmentCount: number;
  securityScore: number;
  monthlyActivity: number;
  userGrowth: string;
}

interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  type: 'user' | 'security' | 'system' | 'import';
}

export const EnterpriseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization, loading: orgLoading } = useOrganizationData();
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'marketing' | 'reporting'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    departmentCount: 0,
    securityScore: 0,
    monthlyActivity: 0,
    userGrowth: '+0%'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      // Create sample data if needed
      await EnterpriseDataService.createSampleData();
      
      if (currentOrganization?.id) {
        await fetchDashboardData();
      } else {
        // Show fallback data while loading
        setLoading(false);
      }
    };

    initializeData();
  }, [currentOrganization?.id]);

  const fetchDashboardData = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const [metricsData, activityData] = await Promise.all([
        EnterpriseDataService.getDashboardMetrics(currentOrganization.id),
        EnterpriseDataService.getRecentActivity(currentOrganization.id, 5)
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-green-500';
      case 'security': return 'bg-blue-500';
      case 'import': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityStatus = (score: number) => {
    if (score >= 95) return 'Excellent security';
    if (score >= 85) return 'Good security';
    if (score >= 70) return 'Fair security';
    return 'Needs attention';
  };

  if (orgLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-96 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show message if no organization is available
  if (!currentOrganization && !loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's settings, users, and security.
          </p>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No Organization Found</h3>
          <p className="text-muted-foreground mt-2">
            Sample data is being created. Please refresh the page in a moment.
          </p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.userGrowth} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.departmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Across organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.securityScore}%</div>
            <p className="text-xs text-muted-foreground">
              {getSecurityStatus(metrics.securityScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyActivity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Actions this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setActiveTab('departments')}
            >
              <div className="text-left">
                <h3 className="font-medium">Manage Departments</h3>
                <p className="text-sm text-muted-foreground">Organize team structure</p>
              </div>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setActiveTab('marketing')}
            >
              <div className="text-left">
                <h3 className="font-medium">Marketing Dashboard</h3>
                <p className="text-sm text-muted-foreground">Track campaigns and engagement</p>
              </div>
              <Megaphone className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setActiveTab('reporting')}
            >
              <div className="text-left">
                <h3 className="font-medium">Live Reporting</h3>
                <p className="text-sm text-muted-foreground">Real-time metrics and alerts</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()} - {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {currentOrganization?.name || 'Manage your organization'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'departments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('departments')}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          Departments
        </Button>
        <Button
          variant={activeTab === 'marketing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('marketing')}
          className="flex items-center gap-2"
        >
          <Megaphone className="h-4 w-4" />
          Marketing
        </Button>
        <Button
          variant={activeTab === 'reporting' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reporting')}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Live Reports
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'departments' && <DepartmentManagement />}
      {activeTab === 'marketing' && <MarketingDashboard />}
      {activeTab === 'reporting' && <LiveReporting />}
    </div>
  );
};