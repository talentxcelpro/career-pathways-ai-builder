
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FeaturedJobs } from "@/components/dashboard/FeaturedJobs";
import { TrendingCourses } from "@/components/dashboard/TrendingCourses";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CareerInsights } from "@/components/dashboard/CareerInsights";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch featured jobs
  const { data: featuredJobs = [] } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch trending courses
  const { data: trendingCourses = [] } = useQuery({
    queryKey: ['trending-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('enrolled_count', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Mock user stats - in a real app, these would come from the database
  const userStats = {
    coursesCompleted: 12,
    resumeViews: 156,
    appliedJobs: 8,
    profileViews: 89
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Continue building your career journey</p>
        </div>

        {/* Stats Cards */}
        <StatsCards userStats={userStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FeaturedJobs jobs={featuredJobs} />
          <TrendingCourses courses={trendingCourses} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Career Insights */}
        <CareerInsights />
      </div>
    </div>
  );
};

export default Dashboard;
