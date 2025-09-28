import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, FileText, Heart, MessageCircle, Users, UserPlus, 
  Briefcase, GraduationCap, Star, Eye, Activity, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { useUserActivities, useActivityIcon, type UserActivity } from '@/hooks/useUserActivities';

interface ActivityTimelineProps {
  userId: string;
  isOwnProfile?: boolean;
  limit?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  userId,
  isOwnProfile = false,
  limit = 20
}) => {
  const { activities, isLoading, error } = useUserActivities(userId, limit);

  const getIcon = (iconName: string) => {
    const icons = {
      User, FileText, Heart, MessageCircle, Users, UserPlus,
      Briefcase, GraduationCap, Star, Eye, Activity
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Activity;
    return IconComponent;
  };

  if (isLoading) {
    return <ActivityTimelineSkeleton />;
  }

  if (error) {
    return <ActivityTimelineError error={error} />;
  }

  if (activities.length === 0) {
    return <ActivityTimelineEmpty isOwnProfile={isOwnProfile} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <Badge variant="secondary" className="ml-auto">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </Badge>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            isLast={index === activities.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

interface ActivityItemProps {
  activity: UserActivity;
  isLast: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isLast }) => {
  const { icon, color, bgColor } = useActivityIcon(activity.activity_type);
  const IconComponent = activity.activity_type === 'profile_updated' ? User :
                      activity.activity_type === 'post_created' ? FileText :
                      activity.activity_type === 'post_liked' ? Heart :
                      activity.activity_type === 'post_commented' ? MessageCircle :
                      activity.activity_type === 'connection_made' ? Users :
                      activity.activity_type === 'connection_requested' ? UserPlus :
                      activity.activity_type === 'job_applied' ? Briefcase :
                      activity.activity_type === 'course_enrolled' ? GraduationCap :
                      activity.activity_type === 'skill_added' ? Star :
                      activity.activity_type === 'resume_updated' ? FileText :
                      activity.activity_type === 'profile_viewed' ? Eye : Activity;

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
      )}
      
      {/* Activity icon */}
      <div className={`relative z-10 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <IconComponent className={`w-5 h-5 ${color}`} />
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <Card className="border-l-2 border-l-primary/20 hover:border-l-primary/60 transition-colors hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <UserAvatar 
                    src={activity.profiles?.profile_photo_url}
                    userName={activity.profiles?.full_name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">
                      {activity.activity_title}
                    </h4>
                    {activity.activity_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.activity_description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata badges */}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activity.metadata.post_type && (
                      <Badge variant="outline" className="text-xs">
                        {activity.metadata.post_type}
                      </Badge>
                    )}
                    {activity.metadata.has_media && (
                      <Badge variant="outline" className="text-xs">
                        📷 Media
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ActivityTimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-5 h-5 bg-muted rounded animate-pulse" />
      <div className="w-32 h-6 bg-muted rounded animate-pulse" />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-muted animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                <div className="w-1/2 h-3 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ))}
  </div>
);

const ActivityTimelineError: React.FC<{ error: any }> = ({ error }) => (
  <Card className="border-destructive/20">
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <Activity className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="font-medium text-destructive mb-2">Failed to load activities</h3>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : 'Something went wrong loading the activity timeline.'}
      </p>
    </CardContent>
  </Card>
);

const ActivityTimelineEmpty: React.FC<{ isOwnProfile: boolean }> = ({ isOwnProfile }) => (
  <Card className="border-dashed">
    <CardContent className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">
        {isOwnProfile ? 'Your activity timeline is empty' : 'No recent activity'}
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {isOwnProfile 
          ? 'Start connecting with professionals, creating posts, or updating your profile to see your activity here.'
          : 'When this user interacts on the platform, their public activities will appear here.'
        }
      </p>
      {isOwnProfile && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="text-xs">
            💼 Update profile
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🤝 Connect with professionals
          </Badge>
          <Badge variant="secondary" className="text-xs">
            📝 Create posts
          </Badge>
        </div>
      )}
    </CardContent>
  </Card>
);