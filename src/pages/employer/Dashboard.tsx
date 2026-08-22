
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Eye, TrendingUp, Calendar, Plus, Mail, BarChart3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";
import { CRMWidget } from "@/components/employer/CRMWidget";
import { RoleBasedAccess, PermissionRequestsManager } from "@/components/employer/RoleBasedAccess";
import { ActivityMonitor } from "@/components/employer/ActivityMonitor";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { PendingAccessRequests } from "@/components/employer/PendingAccessRequests";

function DashboardContent() {
  const navigate = useNavigate();

  // Get company ID from team membership
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['user-team-membership'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('company_team_members')
        .select('company_id, role')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('role', { ascending: true }) // Owners first, then admins, etc.
        .limit(1); // Take the first/primary company

      if (error) {
        console.error('Error fetching team data:', error);
        return null;
      }
      
      console.log('Team data retrieved:', data);
      return data && data.length > 0 ? data[0] : null;
    },
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache data
  });

  const companyId = teamData?.company_id;
  const { hasPermission, role, isLoading: permissionsLoading } = useTeamPermissions(companyId);

  console.log('Dashboard state:', { companyId, role, teamData });

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

  if (isLoading || teamLoading || permissionsLoading) {
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

  if (!companyId) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Show pending access requests if user has no company access */}
        <PendingAccessRequests />
        
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Access</h2>
          <p className="text-gray-600">You don't appear to be a member of any company. Please contact your administrator.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-md">
            <img 
              src="/talentxcel-official-logo.png" 
              alt="TalentXcel" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TalentXcel AI Employer Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered hiring management that finds the perfect candidates – Driven by TalentXcel AI</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Role: {role?.toUpperCase()}</Badge>
              {companyId && <Badge variant="secondary">Company Access Active</Badge>}
            </div>
          </div>
        </div>
        <RoleBasedAccess 
          requiredPermission="manage_jobs" 
          companyId={companyId || ''}
          fallbackMessage="You need job management permission to post jobs."
        >
          <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </RoleBasedAccess>
      </div>

      {/* Permission Requests for Owners/Admins */}
      {companyId && <PermissionRequestsManager companyId={companyId} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/jobs/post')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Post New Job</h3>
                <p className="text-sm text-gray-600">Create a job posting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/employer/cv-database')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">CV Database</h3>
                <p className="text-sm text-gray-600">Browse all candidate CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/employer/outreach')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email Outreach</h3>
                <p className="text-sm text-gray-600">Contact candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/employer/analytics')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View performance metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
          onClick={() => navigate('/jobs/manage')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
          onClick={() => navigate('/jobs/manage?filter=active')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
          onClick={() => navigate('/employer/analytics?tab=views')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Job views</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
          onClick={() => navigate('/employer/applications')}
        >
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
      <RoleBasedAccess 
        requiredPermission="access_crm_basic" 
        companyId={companyId || ''}
        fallbackMessage="You need CRM access to view candidate management features."
      >
        <CRMWidget />
      </RoleBasedAccess>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <RoleBasedAccess 
          requiredPermission="manage_jobs" 
          companyId={companyId || ''}
          showRequestOption={false}
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/jobs/manage')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Manage Jobs
              </CardTitle>
              <CardDescription>View and edit your job postings</CardDescription>
            </CardHeader>
          </Card>
        </RoleBasedAccess>

        <RoleBasedAccess 
          requiredPermission="access_crm_full" 
          companyId={companyId || ''}
          fallbackMessage="You need full CRM access to manage candidates."
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/crm/candidates')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Advanced CRM
              </CardTitle>
              <CardDescription>Full candidate relationship management</CardDescription>
            </CardHeader>
          </Card>
        </RoleBasedAccess>

        <RoleBasedAccess 
          requiredPermission="manage_company" 
          companyId={companyId || ''}
          fallbackMessage="You need company management permission to edit profile."
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/profile')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Company Profile
              </CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </CardHeader>
          </Card>
        </RoleBasedAccess>

        <RoleBasedAccess 
          requiredPermission="view_analytics" 
          companyId={companyId || ''}
          fallbackMessage="You need analytics permission to view performance data."
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Analytics
              </CardTitle>
              <CardDescription>Track your hiring performance</CardDescription>
            </CardHeader>
          </Card>
        </RoleBasedAccess>
      </div>

      {/* Activity Monitor for Owners */}
      {companyId && (
        <ActivityMonitor companyId={companyId} />
      )}
    </div>
  );
}

export default function EmployerDashboard() {
  return <DashboardContent />;
}
