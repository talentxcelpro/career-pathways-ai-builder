// Real-time analytics service - production ready
import { supabase } from '@/integrations/supabase/client';
import { fetchProductionData } from '@/utils/productionCleanup';

export interface PlatformAnalytics {
  totalUsers: number;
  newUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  totalPosts: number;
  activeJobs: number;
  pendingApplications: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
  applications: number;
  jobs: number;
}

export interface TopPerformingJob {
  id: string;
  title: string;
  company_name: string;
  applications_count: number;
  views_count: number;
  location: string;
  companies?: {
    name: string;
    logo_url?: string;
    is_verified: boolean;
  };
}

// Real-time platform analytics
export const getPlatformAnalytics = async (dateRange: '7d' | '30d' | '90d' = '7d'): Promise<PlatformAnalytics> => {
  return fetchProductionData(async () => {
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Use unified analytics function for consistent data
    const { data: unifiedJobData } = await supabase.rpc('get_unified_analytics');
    
    const [
      { count: totalUsers },
      { count: newUsers },
      { count: totalCompanies },
      { count: totalPosts },
      { count: activeJobs },
      { count: pendingApplications }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open'),
      supabase.from('job_applications').select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    ]);

    // Calculate totals from unified data
    const totalJobs = unifiedJobData?.length || 0;
    const totalApplications = unifiedJobData?.reduce(
      (sum: number, job: any) => sum + (job.total_applications || 0), 0
    ) || 0;

    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      totalJobs,
      totalApplications,
      totalCompanies: totalCompanies || 0,
      totalPosts: totalPosts || 0,
      activeJobs: activeJobs || 0,
      pendingApplications: pendingApplications || 0
    };
  }, {
    totalUsers: 0,
    newUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
    totalPosts: 0,
    activeJobs: 0,
    pendingApplications: 0
  });
};

// Real-time user growth data
export const getUserGrowthData = async (dateRange: '7d' | '30d' | '90d' = '7d'): Promise<UserGrowthData[]> => {
  return fetchProductionData(async () => {
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data: UserGrowthData[] = [];
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const [
        { count: users },
        { count: applications },
        { count: jobs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`),
        supabase.from('job_applications').select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`),
        supabase.from('jobs').select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)
      ]);
      
      data.push({
        date: dateStr,
        users: users || 0,
        applications: applications || 0,
        jobs: jobs || 0
      });
    }
    
    return data;
  }, []);
};

// Real-time top performing jobs
export const getTopPerformingJobs = async (limit: number = 10): Promise<TopPerformingJob[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase.rpc('get_unified_analytics');
    
    if (error) throw error;
    
    // Sort by applications and return top jobs
    return data
      ?.sort((a: any, b: any) => (b.total_applications || 0) - (a.total_applications || 0))
      .slice(0, limit)
      .map((job: any) => ({
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        applications_count: job.total_applications || 0,
        views_count: job.views_count || 0,
        location: job.location,
        companies: {
          name: job.company_name,
          logo_url: job.company_logo,
          is_verified: job.company_verified || false
        }
      })) || [];
  }, []);
};

// Real-time subscription for analytics updates
export const subscribeToAnalyticsUpdates = (callback: (analytics: PlatformAnalytics) => void) => {
  const tables = ['profiles', 'jobs', 'job_applications', 'companies', 'posts'];
  
  const channels = tables.map(table => {
    return supabase
      .channel(`analytics-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        async () => {
          const analytics = await getPlatformAnalytics();
          callback(analytics);
        }
      )
      .subscribe();
  });

  return () => {
    channels.forEach(channel => supabase.removeChannel(channel));
  };
};

// Export analytics data for admin reports
export const exportAnalyticsData = async (
  startDate: string, 
  endDate: string
): Promise<{ [key: string]: any }> => {
  return fetchProductionData(async () => {
    const [usersData, jobsData, applicationsData] = await Promise.all([
      supabase
        .from('profiles')
        .select('created_at, user_type, location')
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('jobs')
        .select('created_at, employment_type, location, salary_min, salary_max')
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('job_applications')
        .select('created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
    ]);

    return {
      users: usersData.data || [],
      jobs: jobsData.data || [],
      applications: applicationsData.data || [],
      exported_at: new Date().toISOString(),
      date_range: { startDate, endDate }
    };
  }, {});
};