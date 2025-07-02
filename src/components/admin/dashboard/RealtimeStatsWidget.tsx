import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RealtimeStatsProps {
  stats: {
    totalUsers: number;
    activeJobs: number;
    pendingEmployerRequests: number;
    totalApplications: number;
    weeklyNewUsers: number;
    monthlyApplications: number;
  } | undefined;
}

export const RealtimeStatsWidget: React.FC<RealtimeStatsProps> = ({ stats }) => {
  const quickStats = [
    {
      label: 'New Users (7d)',
      value: stats?.weeklyNewUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/users'
    },
    {
      label: 'Applications (30d)',
      value: stats?.monthlyApplications || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/jobs'
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingEmployerRequests || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/admin/employer-requests',
      urgent: true
    },
    {
      label: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/jobs'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Real-time Overview
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="block"
            >
              <div className={`p-4 rounded-lg ${stat.bgColor} hover:shadow-md transition-all cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {stat.urgent && stat.value > 0 && (
                    <Badge variant="destructive" className="text-xs pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};