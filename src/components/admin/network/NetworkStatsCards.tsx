
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Flag, Users, Hash } from 'lucide-react';

interface NetworkStatsCardsProps {
  networkStats: {
    totalPosts: number;
    totalGroups: number;
    totalEvents: number;
    reportedContent: number;
  } | undefined;
}

export const NetworkStatsCards: React.FC<NetworkStatsCardsProps> = ({ networkStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats?.totalPosts?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Flag className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reported Content</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats?.reportedContent?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats?.totalGroups?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Hash className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats?.totalEvents?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
