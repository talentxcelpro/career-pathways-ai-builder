
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Target, BookOpen, Briefcase, Users } from 'lucide-react';

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

  // Fetch dashboard data with optimized queries
  const { data: dashboardStats, isLoading: statsLoading, dataUpdatedAt: statsUpdatedAt } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: realDataService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes for better performance
    gcTime: 10 * 60 * 1000,
  });

  const { data: featuredJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['featured_jobs'],
    queryFn: realDataService.getFeaturedJobs,
    staleTime: 10 * 60 * 1000, // Increased cache time
    gcTime: 15 * 60 * 1000,
  });

  const { data: popularCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['popular_courses'],
    queryFn: realDataService.getPopularCourses,
    staleTime: 15 * 60 * 1000, // Increased cache time
    gcTime: 30 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000, // Cache user profile longer
  });

  const handleRefreshAll = () => {
    manualRefresh();
  };

  if (statsLoading && jobsLoading && coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600 font-medium">Loading your dashboard...</p>
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

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to take your career to the next level?",
      "Your next opportunity is just around the corner!",
      "Every step forward is progress worth celebrating.",
      "Today is a great day to invest in your future!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <OfflineIndicator />
      
      {/* Enhanced Header Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">
                  {getCurrentGreeting()}{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                  Online
                </Badge>
              </div>
              <p className="text-sm text-slate-600 font-medium">{getMotivationalMessage()}</p>
            </div>
            <DataFreshness 
              lastUpdated={new Date(statsUpdatedAt || Date.now())}
              onRefresh={handleRefreshAll}
              isRefreshing={statsLoading}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Enhanced Stats Cards */}
          <StatsCards userStats={userStats} />
          
          {/* Quick Insights Banner */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-90">Weekly Progress</p>
                    <p className="text-lg font-bold">+15% improvement in profile views</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              <FeaturedJobs jobs={featuredJobs} />
              <TrendingCourses courses={popularCourses} />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              <QuickActions />
              <CareerInsights />
              
              {/* Today's Focus Card */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Complete 1 Course</p>
                      <p className="text-xs text-slate-600">2 lessons remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Apply to 3 Jobs</p>
                      <p className="text-xs text-slate-600">Based on your profile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Connect with 2 People</p>
                      <p className="text-xs text-slate-600">Expand your network</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
