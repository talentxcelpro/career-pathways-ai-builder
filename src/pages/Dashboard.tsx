
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { FeaturedJobs } from '@/components/dashboard/FeaturedJobs';
import { TrendingCourses } from '@/components/dashboard/TrendingCourses';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CareerInsights } from '@/components/dashboard/CareerInsights';
import { useDashboardAutoRefresh } from '@/hooks/useAutoRefresh';
import { useRealtimeMessages, useRealtimeJobs } from '@/hooks/useRealtimeData';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { realDataService } from '@/utils/realDataService';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  // Auto-refresh and real-time updates
  const { manualRefresh } = useDashboardAutoRefresh();
  useRealtimeMessages();
  useRealtimeJobs();

  // Meta tags
  useEffect(() => {
    updateMetaTags({
      title: 'Dashboard | TalentXcel - Your Career Command Center',
      description: 'Track your job applications, discover new opportunities, and accelerate your career growth with TalentXcel.',
      url: `${window.location.origin}/dashboard`,
    });
  }, []);

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading, dataUpdatedAt: statsUpdatedAt } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: realDataService.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: featuredJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['featured_jobs'],
    queryFn: realDataService.getFeaturedJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: popularCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['popular_courses'],
    queryFn: realDataService.getPopularCourses,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleRefreshAll = () => {
    manualRefresh();
  };

  if (statsLoading && jobsLoading && coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Transform stats to match StatsCards interface
  const userStats = {
    coursesCompleted: dashboardStats?.coursesCompleted || 0,
    resumeViews: dashboardStats?.resumeViews || 0,
    appliedJobs: dashboardStats?.appliedJobs || 0,
    profileViews: dashboardStats?.profileViews || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your career journey</p>
          </div>
          <DataFreshness 
            lastUpdated={new Date(statsUpdatedAt || Date.now())}
            onRefresh={handleRefreshAll}
            isRefreshing={statsLoading}
          />
        </div>

        <div className="space-y-8">
          <StatsCards userStats={userStats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FeaturedJobs jobs={featuredJobs} />
            <TrendingCourses courses={popularCourses} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuickActions />
            <CareerInsights />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
