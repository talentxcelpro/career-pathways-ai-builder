import React from 'react';
import { useActivityLogs, useTeamPermissions } from '@/hooks/useTeamPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, FileText, Settings, Shield, Eye } from 'lucide-react';
import { ActivityLog } from '@/types/team';

interface ActivityMonitorProps {
  companyId: string;
}

export const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ companyId }) => {
  const { hasPermission } = useTeamPermissions(companyId);
  const { activityLogs, isLoading } = useActivityLogs(companyId);

  if (!hasPermission('view_activity_logs')) {
    return null;
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'job_created':
      case 'job_updated':
      case 'job_deleted':
        return <FileText className="h-4 w-4" />;
      case 'team_member_added':
      case 'team_member_removed':
      case 'role_changed':
        return <User className="h-4 w-4" />;
      case 'permission_requested':
      case 'permission_approved':
      case 'permission_rejected':
        return <Shield className="h-4 w-4" />;
      case 'company_updated':
      case 'settings_changed':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (actionType: string) => {
    if (actionType.includes('deleted') || actionType.includes('rejected')) return 'destructive';
    if (actionType.includes('created') || actionType.includes('approved')) return 'default';
    if (actionType.includes('permission')) return 'secondary';
    return 'outline';
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Team Activity Monitor
        </CardTitle>
        <CardDescription>
          Track all team member activities and system changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activityLogs?.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(log.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {(log as ActivityLog).user?.full_name || (log as ActivityLog).user?.email}
                      </span>
                      <Badge variant={getActivityColor(log.action_type) as any} className="text-xs">
                        {formatActionType(log.action_type)}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-xs text-gray-600">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  {log.resource_type && (
                    <div className="text-xs text-gray-500 mt-1">
                      Resource: {log.resource_type}
                      {log.resource_id && ` (${log.resource_id.slice(0, 8)}...)`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!activityLogs || activityLogs.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity logs found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};