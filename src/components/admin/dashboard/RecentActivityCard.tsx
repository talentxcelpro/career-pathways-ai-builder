
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    profiles: { full_name: string } | null;
    jobs: { title: string } | null;
    applied_at: string;
  }> | undefined;
}

export const RecentActivityCard: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities?.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {activity.profiles?.full_name || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-600">
                  Applied to {activity.jobs?.title || 'Unknown Job'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.applied_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
