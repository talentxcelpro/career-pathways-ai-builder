import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Eye, Calendar } from 'lucide-react';

interface NetworkStatsProps {
  stats?: {
    connections: number;
    messages: number;
    profileViews: number;
    events: number;
  };
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  stats = { connections: 14, messages: 0, profileViews: 167, events: 0 }
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900">Network Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">Connections</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">{stats.connections}</span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Messages</span>
          </div>
          <span className="text-sm font-semibold text-green-600">{stats.messages}</span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-700">Profile Views</span>
          </div>
          <span className="text-sm font-semibold text-purple-600">{stats.profileViews}</span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-700">Events</span>
          </div>
          <span className="text-sm font-semibold text-orange-600">{stats.events}</span>
        </div>
      </CardContent>
    </Card>
  );
};