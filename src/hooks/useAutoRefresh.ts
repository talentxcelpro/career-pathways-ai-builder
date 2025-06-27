
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AutoRefreshConfig {
  queryKeys: string[];
  interval: number; // in milliseconds
  enabled?: boolean;
}

export const useAutoRefresh = ({ queryKeys, interval, enabled = true }: AutoRefreshConfig) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    };

    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryKeys, interval, enabled, queryClient]);

  const manualRefresh = () => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  return { manualRefresh };
};

// Predefined refresh configurations
export const useJobsAutoRefresh = () => {
  return useAutoRefresh({
    queryKeys: ['jobs', 'featured_jobs', 'job_categories'],
    interval: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMessagesAutoRefresh = () => {
  return useAutoRefresh({
    queryKeys: ['conversations', 'messages', 'notifications'],
    interval: 30 * 1000, // 30 seconds
  });
};

export const useDashboardAutoRefresh = () => {
  return useAutoRefresh({
    queryKeys: ['dashboard_stats', 'recent_activities', 'job_recommendations'],
    interval: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProfileAutoRefresh = () => {
  return useAutoRefresh({
    queryKeys: ['profile_views', 'connections', 'connection_requests'],
    interval: 60 * 1000, // 1 minute
  });
};
