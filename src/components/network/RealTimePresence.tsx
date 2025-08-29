import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserPresence } from '@/hooks/useUserPresence';

interface RealTimePresenceProps {
  userId?: string;
  showLastSeen?: boolean;
  variant?: 'dot' | 'badge' | 'text';
}

export const RealTimePresence: React.FC<RealTimePresenceProps> = ({
  userId,
  showLastSeen = true,
  variant = 'dot'
}) => {
  const [presenceData, setPresenceData] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
  }>({ isOnline: false, lastSeen: null });

  // Initialize user presence for current user
  useUserPresence();

  useEffect(() => {
    if (!userId) return;

    // Fetch initial presence data
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_online, last_seen')
        .eq('id', userId)
        .single();

      if (data) {
        setPresenceData({
          isOnline: data.is_online || false,
          lastSeen: data.last_seen
        });
      }
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          setPresenceData({
            isOnline: payload.new.is_online || false,
            lastSeen: payload.new.last_seen
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getLastSeenText = (lastSeen: string | null): string => {
    if (!lastSeen) return 'Never';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Over a week ago';
  };

  if (variant === 'dot') {
    return (
      <div className={`h-3 w-3 rounded-full ${
        presenceData.isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`} />
    );
  }

  if (variant === 'badge') {
    return (
      <Badge variant={presenceData.isOnline ? 'default' : 'secondary'} className="text-xs">
        {presenceData.isOnline ? 'Online' : (showLastSeen ? getLastSeenText(presenceData.lastSeen) : 'Offline')}
      </Badge>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`text-xs ${
        presenceData.isOnline ? 'text-green-600' : 'text-gray-500'
      }`}>
        {presenceData.isOnline ? 'Online' : (showLastSeen ? `Last seen ${getLastSeenText(presenceData.lastSeen)}` : 'Offline')}
      </span>
    );
  }

  return null;
};