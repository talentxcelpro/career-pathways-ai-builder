
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PendingActionsProps {
  stats: {
    pendingEmployerRequests: number;
    activeJobs: number;
    totalCompanies: number;
  } | undefined;
}

export const PendingActionsCard: React.FC<PendingActionsProps> = ({ stats }) => {
  const pendingActions = [
    { 
      label: 'Employer Requests', 
      count: stats?.pendingEmployerRequests || 0, 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      url: '/admin/employer-requests' 
    },
    { 
      label: 'Job Approvals', 
      count: Math.floor((stats?.activeJobs || 0) * 0.1), 
      icon: Clock, 
      color: 'text-yellow-600', 
      url: '/admin/jobs' 
    },
    { 
      label: 'Reported Content', 
      count: 3, 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      url: '/admin/network' 
    },
    { 
      label: 'Company Verifications', 
      count: Math.floor((stats?.totalCompanies || 0) * 0.2), 
      icon: CheckCircle, 
      color: 'text-green-600', 
      url: '/admin/companies' 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Pending Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pendingActions.map((action, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-gray-500">Needs attention</p>
                  </div>
                </div>
                <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {action.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
