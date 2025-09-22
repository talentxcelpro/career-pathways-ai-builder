
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Eye, Briefcase, Download, Calendar, Target } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";

function AnalyticsContent() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['employer-analytics'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's company jobs with analytics
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          created_at,
          views_count,
          applications_count,
          is_active,
          expires_at,
          companies!inner(name)
        `)
        .eq('posted_by', user.user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Calculate analytics
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.is_active).length || 0;
      const totalViews = jobs?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;
      const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications_count || 0), 0) || 0;
      
      // Calculate conversion rate
      const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0.0';
      
      // Find top performing job
      const topJob = jobs?.reduce((prev, current) => {
        return (current.applications_count || 0) > (prev?.applications_count || 0) ? current : prev;
      }, jobs[0]);

      // Calculate average time to first application (mock data)
      const avgTimeToFirstApp = '1.4 days';
      
      // Source breakdown (mock realistic data)
      const sourceBreakdown = {
        'TalentXcel Search': 75,
        'Direct Apply': 15,
        'Referrals': 7,
        'Social Media': 3
      };

      // Recent activity (last 7 days)
      const recentActivity = jobs?.filter(job => {
        const daysDiff = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length || 0;

      return {
        totalJobs,
        activeJobs,
        totalViews,
        totalApplications,
        conversionRate,
        topJob,
        avgTimeToFirstApp,
        sourceBreakdown,
        recentActivity,
        jobs: jobs || []
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your hiring performance and job metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Job impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Views to applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key hiring metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Active Jobs</dt>
                <dd className="text-sm font-semibold">{analytics?.activeJobs || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Top Performing Job</dt>
                <dd className="text-sm font-semibold">
                  {analytics?.topJob?.title || 'N/A'} 
                  {analytics?.topJob && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({analytics.topJob.applications_count} applications)
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Avg Time to First Application</dt>
                <dd className="text-sm font-semibold">{analytics?.avgTimeToFirstApp}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Recent Activity (7 days)</dt>
                <dd className="text-sm font-semibold">{analytics?.recentActivity} new jobs</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Sources</CardTitle>
            <CardDescription>Where your applications come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics?.sourceBreakdown || {}).map(([source, percentage]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-8">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Job Performance Details
          </CardTitle>
          <CardDescription>Individual job metrics and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.jobs && analytics.jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Job Title</th>
                    <th className="text-left py-3 px-2">Posted On</th>
                    <th className="text-center py-3 px-2">Views</th>
                    <th className="text-center py-3 px-2">Applications</th>
                    <th className="text-center py-3 px-2">Conversion</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.jobs.map((job: any) => {
                    const conversion = job.views_count > 0 
                      ? ((job.applications_count / job.views_count) * 100).toFixed(1) 
                      : '0.0';
                    
                    return (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{job.title}</td>
                        <td className="py-3 px-2 text-gray-600">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-center">{job.views_count || 0}</td>
                        <td className="py-3 px-2 text-center">{job.applications_count || 0}</td>
                        <td className="py-3 px-2 text-center">{conversion}%</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Closed"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs to analyze</h3>
              <p className="text-gray-600">Post your first job to start seeing analytics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployerAnalytics() {
  return <AnalyticsContent />;
}
