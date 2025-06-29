
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, TrendingUp, Calendar, Plus, BarChart3, Building2 } from "lucide-react";
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

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['employer-dashboard-stats'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get user's company
        const { data: teamMember } = await supabase
          .from('company_team_members')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (!teamMember) {
          return {
            activeJobs: 0,
            totalApplications: 0,
            interviewsThisWeek: 0,
            jobsPostedThisMonth: 0
          };
        }

        // Get active jobs count
        const { count: activeJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', teamMember.company_id)
          .eq('is_active', true);

        // Get total applications count
        const { data: applications } = await supabase
          .from('job_applications')
          .select('id, jobs!inner(company_id)')
          .eq('jobs.company_id', teamMember.company_id);

        // Get jobs posted this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: jobsThisMonth } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', teamMember.company_id)
          .gte('created_at', startOfMonth.toISOString());

        // Get interviews this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const { count: interviewsThisWeek } = await supabase
          .from('interviews')
          .select('*, job_applications!inner(job_id, jobs!inner(company_id))', { count: 'exact', head: true })
          .eq('job_applications.jobs.company_id', teamMember.company_id)
          .gte('scheduled_at', startOfWeek.toISOString())
          .lt('scheduled_at', endOfWeek.toISOString());

        return {
          activeJobs: activeJobs || 0,
          totalApplications: applications?.length || 0,
          interviewsThisWeek: interviewsThisWeek || 0,
          jobsPostedThisMonth: jobsThisMonth || 0
        } as DashboardStats;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          activeJobs: 0,
          totalApplications: 0,
          interviewsThisWeek: 0,
          jobsPostedThisMonth: 0
        } as DashboardStats;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      description: "Currently open positions",
      action: () => navigate('/jobs/manage'),
      color: "text-blue-600",
      change: stats?.activeJobs ? `${stats.activeJobs} active` : "No active jobs"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: Users,
      description: "Applications received",
      action: () => navigate('/jobs/manage'),
      color: "text-green-600",
      change: stats?.totalApplications ? `${stats.totalApplications} total` : "No applications yet"
    },
    {
      title: "Interviews This Week",
      value: stats?.interviewsThisWeek || 0,
      icon: Calendar,
      description: "Scheduled interviews",
      action: () => navigate('/jobs/manage'),
      color: "text-purple-600",
      change: stats?.interviewsThisWeek ? `${stats.interviewsThisWeek} scheduled` : "No interviews scheduled"
    },
    {
      title: "Jobs Posted This Month",
      value: stats?.jobsPostedThisMonth || 0,
      icon: TrendingUp,
      description: "New postings",
      action: () => navigate('/jobs/post'),
      color: "text-orange-600",
      change: stats?.jobsPostedThisMonth ? `${stats.jobsPostedThisMonth} this month` : "No jobs posted this month"
    }
  ];

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create a new job posting",
      icon: Plus,
      action: () => navigate('/jobs/post'),
      primary: true,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Manage Jobs",
      description: "View and edit your job postings",
      icon: Briefcase,
      action: () => navigate('/jobs/manage'),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Analytics",
      description: "Track job performance",
      icon: BarChart3,
      action: () => navigate('/employer/analytics'),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Company Profile",
      description: "Manage company information",
      icon: Building2,
      action: () => navigate('/employer/profile'),
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
              <p className="text-sm text-slate-600 font-medium">Manage your hiring pipeline and track performance</p>
            </div>
            <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm" onClick={stat.action}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color.includes('blue') ? 'from-blue-500 to-cyan-500' : stat.color.includes('green') ? 'from-green-500 to-emerald-500' : stat.color.includes('purple') ? 'from-purple-500 to-violet-500' : 'from-orange-500 to-red-500'}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <p className="text-xs text-slate-600 mb-2">{stat.description}</p>
                    <div className="text-xs text-slate-500">{stat.change}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
              <CardDescription>Get started with common employer tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-6 h-auto flex flex-col items-center justify-center space-y-3 transition-all duration-200 hover:scale-105 shadow-lg`}
                      variant="default"
                    >
                      <Icon className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">{action.title}</div>
                        <div className="text-xs opacity-90 mt-1">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity placeholder for future implementation */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your hiring pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activity to display</p>
                <p className="text-xs mt-1">Activity will appear here as you manage jobs and applications</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
