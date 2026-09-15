import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, FileText, Calendar, MapPin, ExternalLink, TrendingUp, BarChart3, Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivityProps {
  userId: string;
  isOwnProfile?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'profile_update' | 'post' | 'profile_view' | 'analytics_insight';
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  analyticsData?: {
    metric: string;
    value: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

interface ProfileData {
  updated_at: string | null;
  created_at: string;
  full_name: string | null;
  profile_picture_url: string | null;
  last_login_at: string | null;
  login_count: number | null;
  profile_views_count: number | null;
}

interface PostData {
  id: string;
  headline: string | null;
  content: string | null;
  created_at: string;
  post_type: string | null;
  likes_count: number;
  comments_count: number;
}

interface ProfileViewData {
  viewed_at: string;
  viewer_id: string | null;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  isOwnProfile = false
}) => {
  // Fetch profile data to show recent profile activity
  const { data: profile } = useQuery({
    queryKey: ['profile-activity', userId],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!userId) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('updated_at, created_at, full_name, profile_picture_url, last_login_at, login_count, profile_views_count')
          .eq('id', userId as any)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile activity:', error);
          return null;
        }
        return data as ProfileData | null;
      } catch (err) {
        console.error('Profile query failed:', err);
        return null;
      }
    },
    enabled: !!userId,
  });

  // Fetch recent posts
  const { data: posts } = useQuery({
    queryKey: ['user-posts-activity', userId],
    queryFn: async (): Promise<PostData[]> => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, headline, content, created_at, post_type, likes_count, comments_count')
          .eq('user_id', userId as any)
          .eq('is_deleted', false as any)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching user posts:', error);
          return [];
        }
        return (data as PostData[]) || [];
      } catch (err) {
        console.error('Posts query failed:', err);
        return [];
      }
    },
    enabled: !!userId,
  });

  // Fetch analytics data for insights
  const { data: profileViews } = useQuery({
    queryKey: ['profile-views-analytics', userId],
    queryFn: async (): Promise<ProfileViewData[]> => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('profile_views')
          .select('viewed_at, viewer_id')
          .eq('profile_id', userId as any)
          .order('viewed_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching profile views:', error);
          return [];
        }
        return (data as ProfileViewData[]) || [];
      } catch (err) {
        console.error('Profile views query failed:', err);
        return [];
      }
    },
    enabled: !!userId,
  });

  // Generate activity items from available data
  const generateActivityItems = (): ActivityItem[] => {
    const items: ActivityItem[] = [];

    if (profile && profile.created_at) {
      // Profile creation activity
      items.push({
        id: `profile-created-${profile.created_at}`,
        type: 'profile_update',
        title: 'Joined the platform',
        description: 'Created their professional profile',
        timestamp: profile.created_at,
        icon: User,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      });

      // Profile updates (only if actually updated after creation)
      if (profile.updated_at && profile.updated_at !== profile.created_at) {
        const updateTime = new Date(profile.updated_at);
        const createTime = new Date(profile.created_at);
        // Only show if updated more than 1 minute after creation
        if (updateTime.getTime() - createTime.getTime() > 60000) {
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
      }

      // Profile views activity (only if meaningful number of views)
      if (profile.profile_views_count && profile.profile_views_count > 0) {
        items.push({
          id: `profile-views-${profile.profile_views_count}`,
          type: 'profile_view',
          title: 'Growing professional presence',
          description: `Profile has attracted ${profile.profile_views_count} ${profile.profile_views_count === 1 ? 'view' : 'views'}`,
          timestamp: profile.updated_at || profile.created_at,
          icon: Calendar,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50'
        });
      }

      // Login activity (only if has logged in)
      if (profile.last_login_at && profile.login_count && profile.login_count > 0) {
        items.push({
          id: `login-${profile.last_login_at}`,
          type: 'profile_view',
          title: `Active member (${profile.login_count} ${profile.login_count === 1 ? 'session' : 'sessions'})`,
          description: `Last active ${formatDistanceToNow(new Date(profile.last_login_at), { addSuffix: true })}`,
          timestamp: profile.last_login_at,
          icon: Calendar,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50'
        });
      }
    }

    // Real posts activity
    if (posts && Array.isArray(posts) && posts.length > 0) {
      posts.forEach(post => {
        if (post && post.created_at) {
          const postTitle = post.headline || 'Shared a post';
          const likesCount = post.likes_count || 0;
          const commentsCount = post.comments_count || 0;
          const engagement = likesCount + commentsCount;
          const engagementText = engagement > 0 ? ` (${engagement} ${engagement === 1 ? 'interaction' : 'interactions'})` : '';
          
          items.push({
            id: `post-${post.id}`,
            type: 'post',
            title: postTitle,
            description: (post.content?.substring(0, 120) || 'Shared content on the platform') + engagementText,
            timestamp: post.created_at,
            icon: FileText,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50'
          });
        }
      });
    }

    // Analytics insights (glimpse for /profile/analytics)
    if (profileViews && Array.isArray(profileViews) && profileViews.length > 0) {
      // Recent profile view trend
      const recentViews = profileViews.filter(view => {
        if (view && view.viewed_at) {
          const viewDate = new Date(view.viewed_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return viewDate > weekAgo;
        }
        return false;
      });

      if (recentViews.length > 0) {
        items.push({
          id: `analytics-trend-${Date.now()}`,
          type: 'analytics_insight',
          title: '📊 Analytics Insight',
          description: `${recentViews.length} profile views this week • Growing visibility`,
          timestamp: recentViews[0].viewed_at,
          icon: TrendingUp,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          analyticsData: {
            metric: 'Weekly Views',
            value: recentViews.length,
            trend: recentViews.length > 2 ? 'up' : 'stable'
          }
        });
      }

      // Unique viewers analytics
      const uniqueViewers = new Set(profileViews.filter(v => v && v.viewer_id).map(v => v.viewer_id)).size;
      if (uniqueViewers > 1) {
        items.push({
          id: `analytics-unique-${Date.now()}`,
          type: 'analytics_insight',
          title: '👥 Audience Reach',
          description: `Reached ${uniqueViewers} unique ${uniqueViewers === 1 ? 'visitor' : 'visitors'} • Expanding network`,
          timestamp: profileViews[0].viewed_at,
          icon: BarChart3,
          color: 'text-cyan-500',
          bgColor: 'bg-cyan-50',
          analyticsData: {
            metric: 'Unique Viewers',
            value: uniqueViewers,
            trend: uniqueViewers > 3 ? 'up' : 'stable'
          }
        });
      }
    }

    // Engagement analytics from posts
    if (posts && Array.isArray(posts) && posts.length > 0) {
      const totalEngagement = posts.reduce((sum, post) => {
        if (post && typeof post.likes_count === 'number' && typeof post.comments_count === 'number') {
          return sum + post.likes_count + post.comments_count;
        }
        return sum;
      }, 0);
      
      if (totalEngagement > 0) {
        items.push({
          id: `analytics-engagement-${Date.now()}`,
          type: 'analytics_insight',
          title: '💬 Content Performance',
          description: `${totalEngagement} total interactions across ${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`,
          timestamp: posts[0].created_at,
          icon: Eye,
          color: 'text-pink-500',
          bgColor: 'bg-pink-50',
          analyticsData: {
            metric: 'Engagement Rate',
            value: Math.round(totalEngagement / posts.length),
            trend: totalEngagement > posts.length ? 'up' : 'stable'
          }
        });
      }
    }

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);
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
  profile: ProfileData | null;
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
                  <UserAvatar 
                    src={profile?.profile_picture_url}
                    userName={profile?.full_name}
                    size="sm"
                  />
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
                  {activity.analyticsData && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.analyticsData.metric}: {activity.analyticsData.value}
                      {activity.analyticsData.trend === 'up' && ' ↗️'}
                      {activity.analyticsData.trend === 'down' && ' ↘️'}
                      {activity.analyticsData.trend === 'stable' && ' →'}
                    </Badge>
                  )}
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