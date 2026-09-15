import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Circle, Minimize2 } from 'lucide-react';

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

  // Fetch current user profile for presence metadata
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('full_name, profile_picture_url').eq('id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

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
          // Track current user's presence with privacy-first labels
          await presenceChannel.track({
            user_id: user.id,
            user_name: profile?.full_name || 'Strategic Professional',
            user_avatar: profile?.profile_picture_url,
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

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Smart auto-hide: Hide when low activity to keep UI premium and clean
  if (onlineUsers.length < 3 && !isExpanded) {
    return null;
  }

  // Show online users widget
  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isExpanded ? (
        <Card className="w-80 shadow-2xl glass-pro border-white/20 animate-scale-in overflow-hidden rounded-[32px]">
          <CardHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Network Signals ({onlineUsers.length})
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-white/50 transition-colors" 
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="h-4 w-4 text-slate-400" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
              {/* Current user status */}
              <div className="flex items-center gap-3 p-3 bg-white/50 border border-white/50 rounded-2xl shadow-sm">
                <Avatar className="h-10 w-10 rounded-xl border border-white shadow-sm">
                  <AvatarFallback className="bg-primary text-white text-xs font-apple-heavy">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-apple-bold text-slate-900">You</p>
                  <p className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Strategist</p>
                </div>
                <Badge variant="outline" className="ml-auto bg-white border-slate-100 px-2 py-0.5 h-6 rounded-lg">
                  <div className={`h-1.5 w-1.5 rounded-full mr-2 ${getStatusColor(userStatus)}`} />
                  <span className="text-[9px] uppercase tracking-widest font-apple-heavy text-slate-500">{getStatusText(userStatus)}</span>
                </Badge>
              </div>

              {/* Other online users */}
              <div className="pt-2 space-y-1">
                {onlineUsers
                  .filter(u => u.user_id !== user?.id)
                  .map((onlineUser) => (
                    <div key={onlineUser.user_id} className="flex items-center gap-3 p-3 hover:bg-white/50 border border-transparent hover:border-white/50 rounded-2xl transition-all duration-300 group">
                      <Avatar className="h-10 w-10 rounded-xl border border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        <AvatarImage src={onlineUser.user_avatar} className="object-cover" />
                        <AvatarFallback className="text-xs bg-slate-100 font-apple-heavy text-slate-400">
                          {onlineUser.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-apple-bold text-slate-900 truncate group-hover:text-primary transition-colors">{onlineUser.user_name}</p>
                        <p className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Active Now</p>
                      </div>
                      <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] border-2 border-white" />
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 px-6 rounded-2xl shadow-2xl bg-slate-950 text-white hover:scale-105 transition-all duration-500 flex items-center gap-3 group border border-white/10"
        >
          <div className="relative">
            <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </div>
            <Users className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[8px] font-apple-heavy uppercase tracking-[0.2em] opacity-50">Signal</span>
            <span className="font-apple-heavy text-[10px] uppercase tracking-[0.15em]">{onlineUsers.length} Active</span>
          </div>
        </Button>
      )}
    </div>
  );
};
