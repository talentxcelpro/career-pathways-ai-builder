import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UserPresenceProps {
  userId: string;
  children: React.ReactNode;
}

export const UserPresenceProvider: React.FC<UserPresenceProps> = ({ userId, children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let presenceInterval: NodeJS.Timeout;

    const updatePresence = async (online: boolean) => {
      try {
        await supabase.rpc('update_user_presence_status', {
          p_user_id: userId,
          p_is_online: online,
          p_status: online ? 'online' : 'offline',
          p_activity: online ? 'browsing' : null
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    const handleVisibilityChange = () => {
      const online = !document.hidden;
      setIsOnline(online);
      updatePresence(online);
    };

    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    // Set initial online status
    updatePresence(true);

    // Update presence every 30 seconds when online
    presenceInterval = setInterval(() => {
      if (isOnline) {
        updatePresence(true);
      }
    }, 30000);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(presenceInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence(false);
    };
  }, [userId, isOnline]);

  return <>{children}</>;
};