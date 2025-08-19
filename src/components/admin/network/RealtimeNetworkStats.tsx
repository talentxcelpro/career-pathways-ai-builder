import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Share,
  Calendar
} from 'lucide-react';

interface NetworkStats {
  totalPosts: number;
  totalGroups: number;
  totalEvents: number;
  reportedContent: number;
  activeUsers: number;
  engagementRate: number;
  realTimeUpdates: number;
}

interface RealtimeNetworkStatsProps {
  networkStats: NetworkStats | undefined;
  realTimeActivity: any[];
}

export const RealtimeNetworkStats: React.FC<RealtimeNetworkStatsProps> = ({
  networkStats,
  realTimeActivity
}) => {
  const stats = [
    {
      title: 'Total Posts',
      value: networkStats?.totalPosts || 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12% from last week'
    },
    {
      title: 'Active Users',
      value: networkStats?.activeUsers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5% from yesterday'
    },
    {
      title: 'Reported Content',
      value: networkStats?.reportedContent || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-2% from last week'
    },
    {
      title: 'Engagement Rate',
      value: `${networkStats?.engagementRate || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+8% from last month'
    },
    {
      title: 'Active Groups',
      value: networkStats?.totalGroups || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+3 new this week'
    },
    {
      title: 'Events',
      value: networkStats?.totalEvents || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+1 upcoming'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Real-time Activity
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-500">
              {networkStats?.realTimeUpdates || 0} updates
            </span>
          </div>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {realTimeActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No real-time activity yet. Waiting for updates...
              </p>
            ) : (
              realTimeActivity.slice(0, 10).map((activity, index) => (
                <div 
                  key={activity.id || index} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'new_post' && (
                      <div className="p-1 bg-blue-100 rounded-full">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'new_comment' && (
                      <div className="p-1 bg-green-100 rounded-full">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'post_reaction' && (
                      <div className="p-1 bg-red-100 rounded-full">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    {activity.type === 'post_deleted' && (
                      <div className="p-1 bg-red-100 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.type === 'new_post' && 'New Post Published'}
                        {activity.type === 'new_comment' && 'New Comment Added'}
                        {activity.type === 'post_reaction' && 'Post Reaction'}
                        {activity.type === 'post_deleted' && 'Post Deleted'}
                        {activity.type === 'post_updated' && 'Post Updated'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.data?.content || 
                       activity.data?.headline || 
                       `ID: ${activity.data?.id || 'Unknown'}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};