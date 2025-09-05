import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Circle } from 'lucide-react';

interface UserPresenceProps {
  userId?: string;
}

interface OnlineUser {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_seen: string;
  current_page?: string;
  is_online: boolean;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ userId }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'offline'>('online');

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to presence updates
    const presenceChannel = supabase
      .channel('user_presence')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users = Object.values(presenceState)
          .flat()
          .map((presence: any) => ({
            user_id: presence.user_id,
            user_name: presence.user_name || 'Unknown User',
            user_avatar: presence.user_avatar,
            last_seen: presence.last_seen,
            current_page: presence.current_page,
            is_online: true
          }));
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Users joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await presenceChannel.track({
            user_id: user.id,
            user_name: user.email,
            user_avatar: null,
            last_seen: new Date().toISOString(),
            current_page: window.location.pathname,
            status: 'online'
          });
        }
      });

    // Update presence on page visibility change
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setUserStatus('away');
        await presenceChannel.track({
          user_id: user.id,
          user_name: user.email,
          status: 'away',
          last_seen: new Date().toISOString()
        });
      } else {
        setUserStatus('online');
        await presenceChannel.track({
          user_id: user.id,
          user_name: user.email,
          status: 'online',
          last_seen: new Date().toISOString(),
          current_page: window.location.pathname
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Update database presence
    updateDatabasePresence(true);

    // Heartbeat to keep presence alive
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        presenceChannel.track({
          user_id: user.id,
          user_name: user.email,
          last_seen: new Date().toISOString(),
          status: userStatus
        });
        updateDatabasePresence(true);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeatInterval);
      updateDatabasePresence(false);
      presenceChannel.unsubscribe();
    };
  }, [user?.id, userStatus]);

  const updateDatabasePresence = async (isOnline: boolean) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        current_page: window.location.pathname,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating presence:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  // If userId is provided, show presence for that specific user
  if (userId && userId !== user?.id) {
    const targetUser = onlineUsers.find(u => u.user_id === userId);
    
    if (!targetUser) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="relative">
          <Circle className={`h-2 w-2 ${getStatusColor('online')}`} />
        </div>
        <span>{getStatusText('online')}</span>
      </div>
    );
  }

  // Show online users widget
  return (
    <Card className="fixed bottom-20 right-4 w-72 z-50 shadow-lg">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Online Now ({onlineUsers.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {/* Current user status */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">You</span>
            <Badge variant="outline" className="ml-auto">
              <Circle className={`h-2 w-2 mr-1 ${getStatusColor(userStatus)}`} />
              {getStatusText(userStatus)}
            </Badge>
          </div>

          {/* Other online users */}
          {onlineUsers
            .filter(u => u.user_id !== user?.id)
            .slice(0, 10)
            .map((onlineUser) => (
              <div key={onlineUser.user_id} className="flex items-center gap-2 p-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={onlineUser.user_avatar} />
                  <AvatarFallback className="text-xs">
                    {onlineUser.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs flex-1 truncate">{onlineUser.user_name}</span>
                <div className="relative">
                  <Circle className="h-2 w-2 bg-green-500" />
                </div>
              </div>
            ))}
          
          {onlineUsers.length === 1 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No other users online
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
