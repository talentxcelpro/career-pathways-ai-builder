import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  Database,
  Server,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SystemHealthProps {
  stats: {
    totalUsers: number;
    totalCompanies: number;
    totalApplications: number;
  } | undefined;
}

export const SystemHealthWidget: React.FC<SystemHealthProps> = ({ stats }) => {
  // Calculate system health metrics
  const getSystemHealth = () => {
    const userGrowthHealth = Math.min(100, (stats?.totalUsers || 0) / 10); // 1000 users = 100%
    const companyHealth = Math.min(100, (stats?.totalCompanies || 0) / 2); // 200 companies = 100%
    const activityHealth = Math.min(100, (stats?.totalApplications || 0) / 5); // 500 applications = 100%
    
    return {
      userGrowth: Math.round(userGrowthHealth),
      companyEngagement: Math.round(companyHealth),
      platformActivity: Math.round(activityHealth),
      overall: Math.round((userGrowthHealth + companyHealth + activityHealth) / 3)
    };
  };

  const health = getSystemHealth();
  
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 60) return { status: 'Good', color: 'text-blue-600', icon: CheckCircle };
    if (score >= 40) return { status: 'Fair', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'Needs Attention', color: 'text-red-600', icon: AlertCircle };
  };

  const overallHealth = getHealthStatus(health.overall);

  const healthMetrics = [
    {
      label: 'User Growth',
      value: health.userGrowth,
      icon: Database,
      color: 'text-blue-600'
    },
    {
      label: 'Company Engagement',
      value: health.companyEngagement,
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      label: 'Platform Activity',
      value: health.platformActivity,
      icon: Zap,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          System Health
        </CardTitle>
        <div className="flex items-center gap-2">
          <overallHealth.icon className={`h-4 w-4 ${overallHealth.color}`} />
          <Badge variant="outline" className={overallHealth.color}>
            {overallHealth.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {health.overall}%
          </div>
          <p className="text-sm text-gray-600">Overall System Health</p>
          <Progress value={health.overall} className="mt-2" />
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metric.value} className="w-16 h-2" />
                <span className="text-sm font-semibold w-8">{metric.value}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        <div className="space-y-2 text-xs">
          {health.overall >= 80 && (
            <p className="text-green-600">✓ All systems operating optimally</p>
          )}
          {health.overall < 80 && health.overall >= 60 && (
            <p className="text-blue-600">ℹ System performance is good</p>
          )}
          {health.overall < 60 && (
            <p className="text-yellow-600">⚠ Consider optimizing user engagement</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};