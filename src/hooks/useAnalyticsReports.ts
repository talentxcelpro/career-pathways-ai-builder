
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getPlatformCareerAnalytics, 
  getUserGrowthData, 
  getTopPerformingJobs,
  subscribeToCareerAnalyticsUpdates
} from '@/services/analyticsService';

export const useCareerAnalyticsReports = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: platformCareerAnalytics, isLoading: CareerAnalyticsLoading } = useQuery({
    queryKey: ['platform-CareerAnalytics', dateRange],
    queryFn: () => getPlatformCareerAnalytics(dateRange),
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
    platformCareerAnalytics,
    userGrowthData,
    topPerformingJobs,
    isLoading: CareerAnalyticsLoading || growthLoading || jobsLoading,
  };
};




