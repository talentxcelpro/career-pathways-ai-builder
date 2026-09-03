import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global 3-second auto-refresher for the entire TalentXcel platform.
 * Keeps all visible views (messages, notifications, post feeds, online status, profile stats)
 * seamlessly refreshed every 3 seconds without requiring manual page reloads.
 */
export const PlatformGlobalAutoRefresher: React.FC = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 3-second auto refresher interval
    const interval = setInterval(() => {
      // Only refetch when tab is active/visible to preserve CPU and battery
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        queryClient.refetchQueries({ type: 'active' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return null;
};
