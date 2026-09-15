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
    return null; // Auto-hide when empty as requested
  }

  return (
    <Card className={cn(
      "glass-pro border-white/20 shadow-2xl overflow-hidden rounded-[32px] transition-all duration-500 animate-in fade-in slide-in-from-right-8",
      className
    )}>
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentModule ? `Syncing in ${getModuleLabel(currentModule)}` : 'Live Signals'}
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-2 py-0.5 rounded-lg font-apple-bold">
            {currentModule ? displayUsers.length : onlineCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
            {displayUsers.map((user) => (
              <div
                key={user.user_id}
                className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 border border-transparent hover:border-white/50 transition-all duration-300 cursor-pointer"
                onClick={() => goToProfile(user.user_id, user.username)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                    <AvatarImage src={user.profile_picture_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-apple-bold text-xs">
                      {formatUserName(user).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm",
                    user.activity_status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-apple-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {formatUserName(user)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">
                      {user.activity_status || 'Active'}
                    </span>
                    {showModule && user.current_module && (
                      <Badge variant="outline" className="text-[9px] font-apple-bold px-1.5 py-0 rounded-md border-slate-200 text-slate-400 uppercase tracking-tighter">
                        {getModuleLabel(user.current_module)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};