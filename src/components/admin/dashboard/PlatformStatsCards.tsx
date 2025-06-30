
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  Building2, 
  BookOpen, 
  TrendingUp,
  Activity
} from 'lucide-react';

interface PlatformStatsProps {
  stats: {
    totalUsers: number;
    activeJobs: number;
    totalCompanies: number;
    totalCourses: number;
    totalApplications: number;
  } | undefined;
}

export const PlatformStatsCards: React.FC<PlatformStatsProps> = ({ stats }) => {
  const platformStats = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      change: '+12%', 
      icon: Users, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Active Jobs', 
      value: stats?.activeJobs?.toLocaleString() || '0', 
      change: '+23%', 
      icon: Briefcase, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Companies', 
      value: stats?.totalCompanies?.toLocaleString() || '0', 
      change: '+15%', 
      icon: Building2, 
      color: 'text-orange-600' 
    },
    { 
      label: 'Courses', 
      value: stats?.totalCourses?.toLocaleString() || '0', 
      change: '+18%', 
      icon: BookOpen, 
      color: 'text-indigo-600' 
    },
    { 
      label: 'Applications', 
      value: stats?.totalApplications?.toLocaleString() || '0', 
      change: '+25%', 
      icon: TrendingUp, 
      color: 'text-pink-600' 
    },
    { 
      label: 'Active Users (30d)', 
      value: Math.floor((stats?.totalUsers || 0) * 0.7).toLocaleString(), 
      change: '+8%', 
      icon: Activity, 
      color: 'text-green-600' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {platformStats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
