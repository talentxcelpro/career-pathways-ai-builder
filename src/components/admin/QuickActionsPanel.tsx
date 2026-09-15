import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  FileText,
  Users,
  Building2,
  Briefcase,
  BookOpen,
  Settings,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionsPanelProps {
  stats: {
    pendingEmployerRequests: number;
    activeJobs: number;
    totalUsers: number;
  } | undefined;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ stats }) => {
  const quickActions = [
    {
      title: 'Create New Job',
      description: 'Add a new job posting',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/jobs',
      action: 'create'
    },
    {
      title: 'Review Employers',
      description: `${stats?.pendingEmployerRequests || 0} pending requests`,
      icon: Building2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/employer-requests',
      urgent: (stats?.pendingEmployerRequests || 0) > 0
    },
    {
      title: 'User Analytics',
      description: `${stats?.totalUsers || 0} total users`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/admins'
    },
    {
      title: 'Security Logs',
      description: 'Monitor system security',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/admin/security'
    },
    {
      title: 'Performance',
      description: 'System optimization',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/admin/analytics'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="block"
            >
              <div className={`p-4 rounded-lg ${action.bgColor} hover:shadow-md transition-all cursor-pointer relative`}>
                <div className="flex flex-col items-center text-center gap-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                  {action.urgent && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs pulse">
                      !
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