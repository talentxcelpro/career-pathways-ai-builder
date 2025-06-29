
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
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Target, BookOpen, Briefcase, Users, Star, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: featuredJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['featured_jobs'],
    queryFn: realDataService.getFeaturedJobs,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: popularCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['popular_courses'],
    queryFn: realDataService.getPopularCourses,
    staleTime: 15 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
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

  // Smart recommendations based on user activity
  const getSmartRecommendations = () => {
    const recommendations = [];
    
    if (userStats.appliedJobs === 0) {
      recommendations.push({
        title: "Start Applying",
        description: "Apply to your first job today",
        action: "Browse Jobs",
        priority: "high",
        icon: Briefcase
      });
    }
    
    if (userStats.coursesCompleted < 3) {
      recommendations.push({
        title: "Skill Up",
        description: "Complete 1 more course this week",
        action: "View Courses",
        priority: "medium",
        icon: BookOpen
      });
    }
    
    if (userStats.profileViews < 10) {
      recommendations.push({
        title: "Boost Visibility",
        description: "Optimize your profile to get more views",
        action: "Edit Profile",
        priority: "medium",
        icon: Users
      });
    }

    return recommendations.slice(0, 3);
  };

  const smartRecommendations = getSmartRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <OfflineIndicator />
      
      {/* Compact Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {getCurrentGreeting()}{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p className="text-xs text-slate-600">Ready to advance your career today?</p>
              </div>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                Active
              </Badge>
            </div>
            <DataFreshness 
              lastUpdated={new Date(statsUpdatedAt || Date.now())}
              onRefresh={handleRefreshAll}
              isRefreshing={statsLoading}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Compact Stats Grid */}
          <StatsCards userStats={userStats} />
          
          {/* Smart Recommendations Bar */}
          {smartRecommendations.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-300" />
                    <div>
                      <p className="font-semibold">Smart Recommendations</p>
                      <p className="text-sm opacity-90">{smartRecommendations[0].title}: {smartRecommendations[0].description}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    {smartRecommendations[0].action}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content - Compact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column - Jobs & Courses */}
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FeaturedJobs jobs={featuredJobs} />
                <TrendingCourses courses={popularCourses} />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              <QuickActions />
              <CareerInsights />
              
              {/* Progress Summary */}
              <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Weekly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-700">Job Applications</span>
                      <span className="text-xs text-slate-600">{userStats.appliedJobs}/5</span>
                    </div>
                    <Progress value={(userStats.appliedJobs / 5) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-700">Course Progress</span>
                      <span className="text-xs text-slate-600">{userStats.coursesCompleted}/2</span>
                    </div>
                    <Progress value={(userStats.coursesCompleted / 2) * 100} className="h-2" />
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Great progress this week!</span>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Profile views</span>
                    <span className="font-medium text-slate-800">+{userStats.profileViews}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Resume downloads</span>
                    <span className="font-medium text-slate-800">+{userStats.resumeViews}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Course completions</span>
                    <span className="font-medium text-slate-800">+{userStats.coursesCompleted}</span>
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
