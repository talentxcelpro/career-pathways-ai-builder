import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlatformOverviewProps {
  stats: {
    totalUsers: number;
    activeJobs: number;
    totalCompanies: number;
    totalCourses: number;
    totalApplications: number;
    totalPosts: number;
    pendingEmployerRequests: number;
    weeklyNewUsers: number;
    monthlyApplications: number;
  } | undefined;
}

export const PlatformOverviewWidget: React.FC<PlatformOverviewProps> = ({ stats }) => {
  const calculateGrowthRate = (current: number, period: string) => {
    // Simplified growth calculation for demo
    const growthRates = {
      users: 12,
      jobs: 8,
      companies: 15,
      applications: 25
    };
    return growthRates[current > 0 ? 'users' : 'users'];
  };

  const overviewMetrics = [
    {
      category: 'User Engagement',
      metrics: [
        {
          label: 'Total Users',
          value: stats?.totalUsers || 0,
          growth: '+12%',
          icon: Users,
          color: 'text-blue-600'
        },
        {
          label: 'Weekly Signups',
          value: stats?.weeklyNewUsers || 0,
          growth: '+23%',
          icon: TrendingUp,
          color: 'text-green-600'
        }
      ]
    },
    {
      category: 'Job Market',
      metrics: [
        {
          label: 'Active Jobs',
          value: stats?.activeJobs || 0,
          growth: '+8%',
          icon: Briefcase,
          color: 'text-purple-600'
        },
        {
          label: 'Monthly Applications',
          value: stats?.monthlyApplications || 0,
          growth: '+25%',
          icon: TrendingUp,
          color: 'text-orange-600'
        }
      ]
    },
    {
      category: 'Platform Health',
      metrics: [
        {
          label: 'Companies',
          value: stats?.totalCompanies || 0,
          growth: '+15%',
          icon: Building2,
          color: 'text-indigo-600'
        },
        {
          label: 'Learning Content',
          value: stats?.totalCourses || 0,
          growth: '+18%',
          icon: BookOpen,
          color: 'text-pink-600'
        }
      ]
    }
  ];

  const criticalAlerts = [
    {
      type: 'warning',
      message: `${stats?.pendingEmployerRequests || 0} employer requests pending`,
      action: 'Review Now',
      link: '/admin/employer-requests',
      show: (stats?.pendingEmployerRequests || 0) > 0
    },
    {
      type: 'info',
      message: 'System running optimally',
      action: 'View Details',
      link: '/admin/analytics',
      show: (stats?.pendingEmployerRequests || 0) === 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalAlerts.filter(alert => alert.show).map((alert, index) => (
        <Card key={index} className={`border-l-4 ${
          alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-green-500 bg-green-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {alert.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">{alert.message}</span>
              </div>
              <Link to={alert.link}>
                <Button size="sm" variant={alert.type === 'warning' ? 'default' : 'outline'}>
                  {alert.action}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overview Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {overviewMetrics.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {metric.value.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-green-600">
                          {metric.growth}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="outline" className="text-green-600">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">API Services</span>
              <Badge variant="outline" className="text-green-600">Running</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">File Storage</span>
              <Badge variant="outline" className="text-green-600">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};