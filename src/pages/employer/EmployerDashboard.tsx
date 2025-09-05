import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  Eye, 
  Send, 
  TrendingUp, 
  Calendar,
  Building,
  Mail,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  profileViews: number;
  emailsSent: number;
  responseRate: number;
}

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    profileViews: 0,
    emailsSent: 0,
    responseRate: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch stats
      const [jobsResponse, applicationsResponse] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, applications_count, views_count, created_at')
          .eq('posted_by', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('job_applications')
          .select(`
            id,
            created_at,
            application_data,
            jobs (title, id)
          `)
          .eq('jobs.posted_by', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (jobsResponse.data) {
        setRecentJobs(jobsResponse.data);
        setStats(prev => ({
          ...prev,
          activeJobs: jobsResponse.data.length,
          totalApplications: jobsResponse.data.reduce((sum, job) => sum + (job.applications_count || 0), 0),
          profileViews: jobsResponse.data.reduce((sum, job) => sum + (job.views_count || 0), 0)
        }));
      }

      if (applicationsResponse.data) {
        setRecentApplications(applicationsResponse.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button asChild className="h-auto p-4 flex-col">
        <Link to="/employer/jobs/new">
          <Plus className="h-6 w-6 mb-2" />
          <span className="text-sm">Post Job</span>
        </Link>
      </Button>
      
      <Button asChild variant="outline" className="h-auto p-4 flex-col">
        <Link to="/employer/candidates">
          <Users className="h-6 w-6 mb-2" />
          <span className="text-sm">Find Talent</span>
        </Link>
      </Button>
      
      <Button asChild variant="outline" className="h-auto p-4 flex-col">
        <Link to="/employer/outreach">
          <Send className="h-6 w-6 mb-2" />
          <span className="text-sm">Bulk Outreach</span>
        </Link>
      </Button>
      
      <Button asChild variant="outline" className="h-auto p-4 flex-col">
        <Link to="/employer/analytics">
          <TrendingUp className="h-6 w-6 mb-2" />
          <span className="text-sm">Analytics</span>
        </Link>
      </Button>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.activeJobs}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
            <Building className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.profileViews}</p>
              <p className="text-sm text-muted-foreground">Profile Views</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.emailsSent}</p>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
            </div>
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.responseRate}%</p>
              <p className="text-sm text-muted-foreground">Response Rate</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your hiring and find the best talent</p>
        </div>
        <Button asChild>
          <Link to="/employer/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActions />
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <StatsCards />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Job Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{job.applications_count || 0}</p>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{job.views_count || 0}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/employer/jobs/${job.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground mb-4">Start hiring by posting your first job</p>
                  <Button asChild>
                    <Link to="/employer/jobs/new">Post Your First Job</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">
                          {application.application_data?.fullName || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Applied to: {application.jobs?.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">New</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">Applications will appear here once candidates start applying</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Tips to Improve Hiring</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Add detailed job descriptions to get quality applications</li>
                    <li>• Use bulk outreach to find passive candidates</li>
                    <li>• Respond quickly to increase acceptance rates</li>
                    <li>• Showcase your company culture and benefits</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">📊 Your Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Average time to hire:</span>
                      <span className="font-medium">12 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application completion rate:</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profile engagement:</span>
                      <span className="font-medium">Good</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};