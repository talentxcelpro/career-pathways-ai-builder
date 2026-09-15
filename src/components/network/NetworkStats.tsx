import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Eye, Calendar } from 'lucide-react';
import { useAccurateProfileStats } from '@/hooks/useAccurateProfileStats';
import { useAuth } from '@/contexts/AuthContext';

interface NetworkStatsProps {
  stats?: {
    connections: number;
    messages: number;
    profileViews: number;
    events: number;
  };
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
  const { user } = useAuth();
  const { data: accurateStats, isLoading } = useAccurateProfileStats(user?.id);
  
  // Use accurate stats if available, otherwise fallback to props
  const displayStats = {
    connections: accurateStats?.connections || stats?.connections || 0,
    messages: stats?.messages || 0, // Messages not tracked in new system yet
    profileViews: accurateStats?.profileViews || stats?.profileViews || 0,
    events: stats?.events || 0 // Events not tracked in new system yet
  };
  return (
    <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm border-slate-200/60 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">Network Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-slate-800 font-medium">Connections</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">{displayStats.connections}</span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-slate-800 font-medium">Messages</span>
          </div>
          <span className="text-sm font-semibold text-green-600">{displayStats.messages}</span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-slate-800 font-medium">Profile Views</span>
          </div>
          <span className="text-sm font-semibold text-purple-600">
            {isLoading ? '...' : `${displayStats.profileViews} (${accurateStats?.uniqueViewers || 0} unique)`}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-slate-800 font-medium">Events</span>
          </div>
          <span className="text-sm font-semibold text-orange-600">{displayStats.events}</span>
        </div>
      </CardContent>
    </Card>
  );
};