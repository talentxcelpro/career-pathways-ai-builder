
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
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });

  const { data: userGrowthData, isLoading: growthLoading } = useQuery({
    queryKey: ['user-growth-data', dateRange],
    queryFn: () => getUserGrowthData(dateRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });

  const { data: topPerformingJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['top-performing-jobs'],
    queryFn: () => getTopPerformingJobs(10),
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
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
