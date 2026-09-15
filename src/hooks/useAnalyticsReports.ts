
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getPlatformAnalytics, 
  getUserGrowthData, 
  getTopPerformingJobs,
  subscribeToAnalyticsUpdates
} from '@/services/analyticsService';

export const useAnalyticsReports = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: platformAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['platform-analytics', dateRange],
    queryFn: () => getPlatformAnalytics(dateRange),
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const { data: userGrowthData, isLoading: growthLoading } = useQuery({
    queryKey: ['user-growth-data', dateRange],
    queryFn: () => getUserGrowthData(dateRange),
    refetchInterval: 60000, // Update every minute
  });

  const { data: topPerformingJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['top-performing-jobs'],
    queryFn: () => getTopPerformingJobs(10),
    refetchInterval: 30000, // Real-time updates
  });

  return {
    dateRange,
    setDateRange: (value: string) => setDateRange(value as '7d' | '30d' | '90d'),
    platformAnalytics,
    userGrowthData,
    topPerformingJobs,
    isLoading: analyticsLoading || growthLoading || jobsLoading,
  };
};
