import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_page?: string;
  is_typing?: boolean;
}

export function useRealtimePresence(channelName: string) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user_presence',
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat() as unknown as UserPresence[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setChannel(presenceChannel);
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [channelName]);

  const updatePresence = useCallback(async (presence: Partial<UserPresence>) => {
    if (!channel) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await channel.track({
      user_id: user.id,
      status: 'online',
      last_seen: new Date().toISOString(),
      ...presence,
    });
  }, [channel]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    await updatePresence({ is_typing: isTyping });
  }, [updatePresence]);

  const setCurrentPage = useCallback(async (page: string) => {
    await updatePresence({ current_page: page });
  }, [updatePresence]);

  return {
    onlineUsers,
    isConnected,
    updatePresence,
    setTyping,
    setCurrentPage,
  };
}
