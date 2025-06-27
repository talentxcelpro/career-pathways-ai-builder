
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
        // Mock data for fast loading - replace with real data when backend is ready
        return {
          activeJobs: 5,
          totalApplications: 42,
          interviewsThisWeek: 8,
          jobsPostedThisMonth: 3
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
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
  });

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      description: "Currently open positions",
      action: () => navigate('/jobs/manage'),
      color: "text-blue-600"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: Users,
      description: "Applications received",
      action: () => navigate('/jobs/manage'),
      color: "text-green-600"
    },
    {
      title: "Interviews This Week",
      value: stats?.interviewsThisWeek || 0,
      icon: Calendar,
      description: "Scheduled interviews",
      action: () => navigate('/employer/crm/candidates'),
      color: "text-purple-600"
    },
    {
      title: "Jobs Posted This Month",
      value: stats?.jobsPostedThisMonth || 0,
      icon: TrendingUp,
      description: "New postings",
      action: () => navigate('/jobs/post'),
      color: "text-orange-600"
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
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={stat.action}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
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
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={action.action}>
              <CardHeader className="text-center space-y-4">
                <div className={`mx-auto p-3 rounded-full ${action.color || 'bg-gray-600'} w-fit`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription className="mt-2">{action.description}</CardDescription>
                </div>
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Senior Frontend Developer</p>
                <p className="text-sm text-gray-600">5 new applications received</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Product Manager</p>
                <p className="text-sm text-gray-600">Interview scheduled for tomorrow</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">UX Designer</p>
                <p className="text-sm text-gray-600">Job post performance: 120% above average</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerDashboard;
