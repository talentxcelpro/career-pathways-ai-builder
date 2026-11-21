import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface RealTimePresenceProps {
  userId?: string;
  showLastSeen?: boolean;
  variant?: 'dot' | 'badge' | 'text';
  initialOnline?: boolean;
  initialLastSeen?: string | null;
}

export const RealTimePresence: React.FC<RealTimePresenceProps> = ({
  userId,
  showLastSeen = true,
  variant = 'dot',
  initialOnline = false,
  initialLastSeen = null,
}) => {
  const [presenceData, setPresenceData] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
  }>({ isOnline: initialOnline, lastSeen: initialLastSeen });

  useEffect(() => {
    if (!userId || initialOnline) return;

    // Lightweight fetch without per-item Realtime channels to prevent WAL sender overload
    let mounted = true;
    const fetchPresence = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_online, last_seen')
          .eq('id', userId)
          .maybeSingle();

        if (mounted && data) {
          setPresenceData({
            isOnline: Boolean(data.is_online),
            lastSeen: data.last_seen || null
          });
        }
      } catch {}
    };

    fetchPresence();
    return () => {
      mounted = false;
    };
  }, [userId, initialOnline]);

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