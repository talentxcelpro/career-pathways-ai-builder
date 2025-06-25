
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, TrendingUp, Calendar, Plus, BarChart3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  interviewsThisWeek: number;
  jobsPostedThisMonth: number;
}

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['employer-dashboard-stats'],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || profile?.user_role !== 'employer') {
        throw new Error('Unauthorized');
      }

      // Get company profile stats
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('owner_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Get recent interviews count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: interviewsCount } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', oneWeekAgo.toISOString());

      // Get jobs posted this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const { count: jobsThisMonth } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      return {
        activeJobs: companyProfile?.active_jobs_count || 0,
        totalApplications: companyProfile?.total_applications_received || 0,
        interviewsThisWeek: interviewsCount || 0,
        jobsPostedThisMonth: jobsThisMonth || 0
      } as DashboardStats;
    }
  });

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      description: "Currently open positions",
      action: () => navigate('/jobs/manage')
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: Users,
      description: "Applications received",
      action: () => navigate('/jobs/manage')
    },
    {
      title: "Interviews This Week",
      value: stats?.interviewsThisWeek || 0,
      icon: Calendar,
      description: "Scheduled interviews",
      action: () => navigate('/employer/interviews')
    },
    {
      title: "Jobs Posted This Month",
      value: stats?.jobsPostedThisMonth || 0,
      icon: TrendingUp,
      description: "New postings",
      action: () => navigate('/jobs/post')
    }
  ];

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create a new job posting",
      icon: Plus,
      action: () => navigate('/jobs/post'),
      primary: true
    },
    {
      title: "Manage Jobs",
      description: "View and edit your job postings",
      icon: Briefcase,
      action: () => navigate('/jobs/manage')
    },
    {
      title: "View Analytics",
      description: "Track job performance",
      icon: BarChart3,
      action: () => navigate('/employer/analytics')
    },
    {
      title: "Team Management",
      description: "Manage team members",
      icon: Users,
      action: () => navigate('/employer/team')
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your jobs and track hiring activity</p>
        </div>
        <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.action}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className={`cursor-pointer hover:shadow-lg transition-shadow ${action.primary ? 'ring-2 ring-blue-500' : ''}`} onClick={action.action}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${action.primary ? 'text-blue-600' : 'text-gray-600'}`} />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity. Start by posting your first job!</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/jobs/post')}
            >
              Post a Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerDashboard;
