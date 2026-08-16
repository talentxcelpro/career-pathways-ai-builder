import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Circle, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface UserPresenceProps {
  userId?: string;
}

interface OnlineUser {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_title?: string;
  last_seen: string;
  is_online: boolean;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch current user's profile info
  const { data: myProfile } = useQuery({
    queryKey: ['my-presence-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, email')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const myDisplayName = myProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'You');
  const myAvatar = myProfile?.profile_picture_url;

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time presence channel
    const presenceChannel = supabase.channel('user_presence_global', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, async () => {
        const state = presenceChannel.presenceState();
        const rawUsers = Object.values(state).flat() as any[];
        
        // Collect user IDs to resolve real names & avatars
        const userIds = Array.from(new Set(rawUsers.map(u => u.user_id).filter(Boolean)));
        
        let profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, title, email')
            .in('id', userIds);

          (profiles || []).forEach(p => {
            profileMap[p.id] = p;
          });
        }

        const formatted: OnlineUser[] = rawUsers.map(p => {
          const prof = profileMap[p.user_id];
          const name = prof?.full_name || p.user_name || (prof?.email ? prof.email.split('@')[0] : 'Professional Member');
          const avatar = prof?.profile_picture_url || p.user_avatar;
          const title = prof?.title || 'Executive Member';

          return {
            user_id: p.user_id,
            user_name: name,
            user_avatar: avatar,
            user_title: title,
            last_seen: p.last_seen || new Date().toISOString(),
            is_online: true
          };
        });

        // Deduplicate by user_id
        const unique = Array.from(new Map(formatted.map(item => [item.user_id, item])).values());
        setOnlineUsers(unique);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            user_name: myDisplayName,
            user_avatar: myAvatar,
            last_seen: new Date().toISOString(),
            current_page: window.location.pathname
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, myDisplayName, myAvatar]);

  if (!user) return null;

  // Render a compact, elegant floating presence trigger widget
  return (
    <div className="fixed bottom-4 right-20 z-40 hidden sm:block">
      {isOpen ? (
        <Card className="w-80 shadow-2xl border border-slate-200 dark:border-border rounded-3xl bg-white dark:bg-card overflow-hidden">
          <CardHeader className="p-3.5 bg-slate-900 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-extrabold flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              Online Now ({onlineUsers.length})
            </CardTitle>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" />
            </button>
          </CardHeader>

          <CardContent className="p-2 space-y-1 max-h-60 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No other members online</p>
            ) : (
              onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser.user_id}
                  onClick={() => {
                    navigate('/network/messages');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src={onlineUser.user_avatar} alt={onlineUser.user_name} />
                      <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">
                        {onlineUser.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-card"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-foreground truncate">{onlineUser.user_name}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold truncate">{onlineUser.user_title}</p>
                  </div>

                  <MessageSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-extrabold shadow-lg hover:bg-slate-800 transition-all border border-slate-800"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online ({onlineUsers.length})</span>
        </button>
      )}
    </div>
  );
};
