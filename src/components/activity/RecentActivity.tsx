import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, FileText, Calendar, MapPin, ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivityProps {
  userId: string;
  isOwnProfile?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'profile_update' | 'post' | 'profile_view';
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  isOwnProfile = false
}) => {
  // Fetch profile data to show recent profile activity
  const { data: profile } = useQuery({
    queryKey: ['profile-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('updated_at, created_at, full_name, profile_picture_url, last_login_at, login_count, profile_views_count')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent posts
  const { data: posts } = useQuery({
    queryKey: ['user-posts-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, headline, content, created_at, post_type, likes_count, comments_count')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Generate activity items from available data
  const generateActivityItems = (): ActivityItem[] => {
    const items: ActivityItem[] = [];

    if (profile) {
      // Profile updates
      if (profile.updated_at && profile.updated_at !== profile.created_at) {
        items.push({
          id: `profile-update-${profile.updated_at}`,
          type: 'profile_update',
          title: 'Updated profile information',
          description: 'Made changes to profile details',
          timestamp: profile.updated_at,
          icon: User,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        });
      }

      // Profile views activity
      if (profile.profile_views_count && profile.profile_views_count > 0) {
        items.push({
          id: `profile-views-${profile.profile_views_count}`,
          type: 'profile_view',
          title: 'Profile gaining visibility',
          description: `Profile has been viewed ${profile.profile_views_count} times`,
          timestamp: profile.updated_at || profile.created_at,
          icon: Calendar,
          color: 'text-green-500',
          bgColor: 'bg-green-50'
        });
      }

      // Recent login activity
      if (profile.last_login_at) {
        items.push({
          id: `login-${profile.last_login_at}`,
          type: 'profile_view',
          title: 'Active on platform',
          description: `Last active ${formatDistanceToNow(new Date(profile.last_login_at), { addSuffix: true })}`,
          timestamp: profile.last_login_at,
          icon: Calendar,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50'
        });
      }
    }

    // Recent posts
    if (posts) {
      posts.forEach(post => {
        items.push({
          id: `post-${post.id}`,
          type: 'post',
          title: 'Published a new post',
          description: post.headline || post.content?.substring(0, 100) + '...',
          timestamp: post.created_at,
          icon: FileText,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50'
        });
      });
    }

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  };

  const activities = generateActivityItems();

  if (activities.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">
            {isOwnProfile ? 'Your activity will appear here' : 'No recent activity'}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {isOwnProfile 
              ? 'Start posting, updating your profile, or connecting with others to see activity here.'
              : 'When this user becomes active on the platform, their activity will appear here.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Badge variant="secondary" className="ml-auto">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </Badge>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityItemComponent 
            key={activity.id} 
            activity={activity} 
            isLast={index === activities.length - 1}
            profile={profile}
          />
        ))}
      </div>
    </div>
  );
};

interface ActivityItemComponentProps {
  activity: ActivityItem;
  isLast: boolean;
  profile: any;
}

const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({ 
  activity, 
  isLast, 
  profile 
}) => {
  const IconComponent = activity.icon;

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
      )}
      
      {/* Activity icon */}
      <div className={`relative z-10 w-12 h-12 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <IconComponent className={`w-5 h-5 ${activity.color}`} />
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <Card className="border-l-2 border-l-primary/20 hover:border-l-primary/60 transition-colors hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.profile_picture_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">
                      {activity.title}
                    </h4>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};