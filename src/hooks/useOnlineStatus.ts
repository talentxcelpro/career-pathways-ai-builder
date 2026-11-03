import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineUser {
  id: string;
  last_seen: string;
  is_online: boolean;
}

export const useOnlineStatus = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    // Supabase Realtime Presence Channel
    const channel = supabase.channel('online_presence_room', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    const updatePresenceState = () => {
      const state = channel.presenceState();
      const activeIds = new Set<string>();

      Object.keys(state).forEach((key) => {
        activeIds.add(key);
      });

      setOnlineUserIds(activeIds);
      setIsOnline(true);
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        updatePresenceState();
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUserIds((prev) => new Set(prev).add(key));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Browser network events
    const handleOnline = () => {
      setIsOnline(true);
      channel.track({ user_id: userId, online_at: new Date().toISOString() });
    };
    const handleOffline = () => {
      setIsOnline(false);
      channel.untrack();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getUserOnlineStatus = useCallback(
    (targetUserId: string): boolean => {
      if (!targetUserId) return false;
      return onlineUserIds.has(targetUserId);
    },
    [onlineUserIds]
  );

  const onlineUsers: OnlineUser[] = Array.from(onlineUserIds).map((id) => ({
    id,
    last_seen: new Date().toISOString(),
    is_online: true,
  }));

  return {
    isUserOnline: isOnline,
    onlineUsers,
    getUserOnlineStatus,
  };
};
