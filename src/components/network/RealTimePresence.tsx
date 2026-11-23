import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PresenceIndicator } from './PresenceIndicator';

interface RealTimePresenceProps {
  userId?: string;
  showLastSeen?: boolean;
  variant?: 'dot' | 'badge' | 'text' | 'compact';
  initialOnline?: boolean;
  initialLastSeen?: string | null;
  initialHeartbeatAt?: string | null;
  presenceVisibility?: string | null;
  className?: string;
}

export const RealTimePresence: React.FC<RealTimePresenceProps> = ({
  userId,
  showLastSeen = true,
  variant = 'dot',
  initialOnline = false,
  initialLastSeen = null,
  initialHeartbeatAt = null,
  presenceVisibility = null,
  className = '',
}) => {
  const [presenceData, setPresenceData] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
    lastHeartbeatAt: string | null;
    visibility: string | null;
  }>({
    isOnline: initialOnline,
    lastSeen: initialLastSeen,
    lastHeartbeatAt: initialHeartbeatAt,
    visibility: presenceVisibility
  });

  useEffect(() => {
    // If initial presence was provided or no userId, skip network request
    if (!userId || (initialOnline && initialHeartbeatAt)) return;

    let mounted = true;
    const fetchPresence = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_online, last_seen, last_heartbeat_at, presence_visibility')
          .eq('id', userId)
          .maybeSingle();

        if (mounted && data) {
          setPresenceData({
            isOnline: Boolean(data.is_online),
            lastSeen: data.last_seen || null,
            lastHeartbeatAt: data.last_heartbeat_at || null,
            visibility: data.presence_visibility || 'everyone'
          });
        }
      } catch {}
    };

    fetchPresence();
    return () => {
      mounted = false;
    };
  }, [userId, initialOnline, initialHeartbeatAt]);

  return (
    <PresenceIndicator
      isOnline={presenceData.isOnline}
      lastSeen={presenceData.lastSeen}
      lastHeartbeatAt={presenceData.lastHeartbeatAt}
      visibility={presenceData.visibility}
      variant={variant === 'compact' ? 'compact' : variant}
      hideIfOffline={!showLastSeen}
      className={className}
    />
  );
};

export default RealTimePresence;
