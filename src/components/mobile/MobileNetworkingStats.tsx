import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Users, Eye, MessageCircle, UserCheck } from 'lucide-react';

export const MobileNetworkingStats: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['mobile-networking-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get connection count
      const { data: connections } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Get profile views (if available)
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_views_count')
        .eq('id', user.id)
        .single();

      // Get posts engagement
      const { data: posts } = await supabase
        .from('posts')
        .select('likes_count, comments_count')
        .eq('author_id', user.id);

      const totalLikes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;

      return {
        connections: connections?.length || 0,
        profileViews: profile?.profile_views_count || 0,
        totalLikes,
        totalComments
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading || !stats) {
    return null;
  }

  const statsData = [
    {
      icon: Users,
      label: 'Connections',
      value: stats.connections,
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      label: 'Profile Views',
      value: stats.profileViews,
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      label: 'Comments',
      value: stats.totalComments,
      color: 'text-purple-600'
    },
    {
      icon: UserCheck,
      label: 'Likes',
      value: stats.totalLikes,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="px-4 pb-4">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Your Network Stats</h3>
          <span className="text-xs text-gray-500 px-2 py-1 bg-white/50 rounded-full">
            This week
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-gray-600">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            Your networking activity is{' '}
            <span className="font-medium text-green-600">
              {stats.connections > 10 ? 'excellent' : stats.connections > 5 ? 'good' : 'growing'}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};