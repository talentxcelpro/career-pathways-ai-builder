
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsReports = () => {
  const [dateRange, setDateRange] = useState('7d');

  const { data: platformAnalytics } = useQuery({
    queryKey: ['platform-analytics', dateRange],
    queryFn: async () => {
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Use unified analytics function for consistent job data
      const { data: unifiedJobData } = await supabase.rpc('get_unified_analytics');
      
      const [
        { count: totalUsers },
        { count: newUsers },
        { count: totalCompanies },
        { count: totalPosts }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true })
      ]);

      // Calculate totals from unified data
      const totalJobs = unifiedJobData?.length || 0;
      const totalApplications = unifiedJobData?.reduce((sum: number, job: any) => sum + (job.total_applications || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalJobs,
        totalApplications,
        totalCompanies: totalCompanies || 0,
        totalPosts: totalPosts || 0
      };
    }
  });

  const { data: userGrowthData } = useQuery({
    queryKey: ['user-growth-data', dateRange],
    queryFn: async () => {
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const data = [];
      
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`);
        
        data.push({
          date: dateStr,
          users: count || 0
        });
      }
      
      return data;
    }
  });

  const { data: topPerformingJobs } = useQuery({
    queryKey: ['top-performing-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unified_analytics');
      
      if (error) throw error;
      
      // Sort by applications and return top 10
      return data
        ?.sort((a: any, b: any) => (b.total_applications || 0) - (a.total_applications || 0))
        .slice(0, 10)
        .map((job: any) => ({
          ...job,
          applications_count: job.total_applications,
          companies: { name: job.company_name }
        })) || [];
    }
  });

  return {
    dateRange,
    setDateRange,
    platformAnalytics,
    userGrowthData,
    topPerformingJobs
  };
};
