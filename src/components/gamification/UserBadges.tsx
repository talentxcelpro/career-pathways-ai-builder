import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Users, Target, Zap } from 'lucide-react';
import { useUserBadges } from '@/hooks/useUserScores';
import { cn } from '@/lib/utils';

interface UserBadgesProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

const badgeIcons: Record<string, React.ReactNode> = {
  'profile_complete': <Star className="h-4 w-4" />,
  'first_post': <Zap className="h-4 w-4" />,
  'networker': <Users className="h-4 w-4" />,
  'achiever': <Target className="h-4 w-4" />,
  'default': <Award className="h-4 w-4" />
};

const badgeColors: Record<string, string> = {
  'profile_complete': 'bg-green-100 text-green-800 border-green-200',
  'first_post': 'bg-blue-100 text-blue-800 border-blue-200',
  'networker': 'bg-purple-100 text-purple-800 border-purple-200',
  'achiever': 'bg-orange-100 text-orange-800 border-orange-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

export const UserBadges: React.FC<UserBadgesProps> = ({ 
  userId, 
  className,
  compact = false 
}) => {
  const { data: badges, isLoading } = useUserBadges(userId);

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-4 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Complete your profile and engage to earn badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {badges.slice(0, 3).map((badge) => (
          <Badge
            key={badge.id}
            variant="outline"
            className={cn(
              "text-xs",
              badgeColors[badge.badge_type] || badgeColors.default
            )}
          >
            {badgeIcons[badge.badge_type] || badgeIcons.default}
            {badge.badge_name}
          </Badge>
        ))}
        {badges.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{badges.length - 3} more
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4" />
          Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "p-2 rounded-lg border text-center space-y-1",
                badgeColors[badge.badge_type] || badgeColors.default
              )}
            >
              <div className="flex justify-center">
                {badgeIcons[badge.badge_type] || badgeIcons.default}
              </div>
              <div className="text-xs font-medium">{badge.badge_name}</div>
              {badge.points_awarded > 0 && (
                <div className="text-xs opacity-75">
                  +{badge.points_awarded} pts
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};