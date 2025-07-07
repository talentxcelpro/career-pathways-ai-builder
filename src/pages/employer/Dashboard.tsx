
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Eye, TrendingUp, Calendar, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";
import { CRMWidget } from "@/components/employer/CRMWidget";

function DashboardContent() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's jobs stats
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, is_active, views_count, applications_count, created_at')
        .eq('posted_by', user.user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.is_active).length || 0;
      const totalViews = jobs?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;
      const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications_count || 0), 0) || 0;

      return {
        totalJobs,
        activeJobs,
        totalViews,
        totalApplications,
        recentJobs: jobs?.slice(0, 5) || []
      };
    }
  });

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
          <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
        </div>
        <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Job views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
          <CardDescription>Your latest job postings</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-4">
              {stats.recentJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{job.views_count || 0}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{job.applications_count || 0}</div>
                      <div className="text-xs text-gray-500">Applications</div>
                    </div>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">Start by posting your first job to attract candidates</p>
              <Button onClick={() => navigate('/jobs/post')}>
                Post Your First Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mini CRM Section */}
      <CRMWidget />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/jobs/manage')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Manage Jobs
            </CardTitle>
            <CardDescription>View and edit your job postings</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/crm/candidates')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              CRM
            </CardTitle>
            <CardDescription>Manage candidate relationships</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/profile')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Company Profile
            </CardTitle>
            <CardDescription>Update your company information</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Analytics
            </CardTitle>
            <CardDescription>Track your hiring performance</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  return (
    <EmployerAccessGuard>
      <DashboardContent />
    </EmployerAccessGuard>
  );
}
