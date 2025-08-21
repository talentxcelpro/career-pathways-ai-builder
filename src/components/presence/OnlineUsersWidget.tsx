import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useProfileLinking } from '@/hooks/useProfileLinking';
import { cn } from '@/lib/utils';
import { Circle, Users } from 'lucide-react';

interface OnlineUsersWidgetProps {
  className?: string;
  maxUsers?: number;
  showModule?: boolean;
  currentModule?: 'reels' | 'network' | 'jobs' | 'profile';
}

export const OnlineUsersWidget: React.FC<OnlineUsersWidgetProps> = ({
  className = '',
  maxUsers = 10,
  showModule = true,
  currentModule,
}) => {
  // Placeholder implementation - would use enhanced presence system
  const onlineUsers: any[] = [];
  const onlineCount = 0;
  const getUsersInModule = (module: string) => [];
  const updateCurrentModule = (module: string) => {};
  const { goToProfile } = useProfileLinking();

  // Update current module when it changes
  useEffect(() => {
    if (currentModule) {
      updateCurrentModule(currentModule);
    }
  }, [currentModule, updateCurrentModule]);

  const displayUsers = currentModule 
    ? getUsersInModule(currentModule)
    : onlineUsers.slice(0, maxUsers);

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'idle':
        return 'text-yellow-500';
      case 'away':
        return 'text-gray-400';
      default:
        return 'text-green-500';
    }
  };

  const getModuleLabel = (module?: string) => {
    switch (module) {
      case 'reels':
        return 'Reels';
      case 'network':
        return 'Network';
      case 'jobs':
        return 'Jobs';
      case 'profile':
        return 'Profile';
      default:
        return 'Online';
    }
  };

  const formatUserName = (user: any) => {
    return user.full_name || user.username || 'Anonymous User';
  };

  if (displayUsers.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {currentModule ? `Online in ${getModuleLabel(currentModule)}` : 'Online Users'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm py-4">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No users online {currentModule ? `in ${getModuleLabel(currentModule)}` : ''}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {currentModule ? `Online in ${getModuleLabel(currentModule)}` : 'Online Users'}
          </div>
          <Badge variant="secondary" className="text-xs">
            {currentModule ? displayUsers.length : onlineCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {displayUsers.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => goToProfile(user.user_id, user.username)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture_url} />
                    <AvatarFallback className="text-xs">
                      {formatUserName(user).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Circle 
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current",
                      getActivityColor(user.activity_status)
                    )}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {formatUserName(user)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{user.activity_status || 'active'}</span>
                    {showModule && user.current_module && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          {getModuleLabel(user.current_module)}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {!currentModule && onlineCount > maxUsers && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              +{onlineCount - maxUsers} more users online
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};