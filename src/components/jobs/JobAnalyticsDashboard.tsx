import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Eye, Users, FileText, TrendingUp, Calendar, MapPin, 
  Clock, DollarSign, Share2, Bookmark, ThumbsUp
} from 'lucide-react';

interface JobAnalytics {
  job_id: string;
  job_title: string;
  company_name: string;
  total_views: number;
  unique_views: number;
  applications: number;
  saves: number;
  shares: number;
  avg_time_on_page: number;
  bounce_rate: number;
  conversion_rate: number;
  daily_stats: Array<{
    date: string;
    views: number;
    applications: number;
  }>;
}

export const JobAnalyticsDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<JobAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchJobAnalytics();
      } else {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, [dateRange]);

  const fetchJobAnalytics = async () => {
    try {
      // Get user's jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          created_at,
          job_analytics (
            views_count,
            applications_count,
            unique_visitors,
            date
          )
        `)
        .eq('posted_by', user?.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Process analytics data
      const processedAnalytics = jobs?.map(job => {
        const analytics = job.job_analytics || [];
        const totalViews = analytics.reduce((sum, a) => sum + (a.views_count || 0), 0);
        const totalUniqueViews = analytics.reduce((sum, a) => sum + (a.unique_visitors || 0), 0);
        const totalApplications = analytics.reduce((sum, a) => sum + (a.applications_count || 0), 0);
        
        return {
          job_id: job.id,
          job_title: job.title,
          company_name: job.company_name,
          total_views: totalViews,
          unique_views: totalUniqueViews,
          applications: totalApplications,
          saves: 0, // Not available in current schema
          shares: 0, // Not available in current schema
          avg_time_on_page: 0, // Not available in current schema
          bounce_rate: 0, // Not available in current schema
          conversion_rate: totalViews > 0 ? (totalApplications / totalViews) * 100 : 0,
          daily_stats: analytics.map(a => ({
            date: a.date,
            views: a.views_count || 0,
            applications: a.applications_count || 0
          }))
        };
      }) || [];

      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      toast.error('Failed to fetch job analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalStats = analytics.reduce((acc, job) => ({
    views: acc.views + job.total_views,
    applications: acc.applications + job.applications,
    saves: acc.saves + job.saves,
    shares: acc.shares + job.shares
  }), { views: 0, applications: 0, saves: 0, shares: 0 });

  const avgConversionRate = analytics.length > 0 
    ? analytics.reduce((sum, job) => sum + job.conversion_rate, 0) / analytics.length 
    : 0;

  const chartData = analytics.slice(0, 5).map(job => ({
    name: job.job_title.substring(0, 20) + '...',
    views: job.total_views,
    applications: job.applications,
    conversion: job.conversion_rate
  }));

  const pieData = [
    { name: 'Views', value: totalStats.views, color: '#8884d8' },
    { name: 'Applications', value: totalStats.applications, color: '#82ca9d' },
    { name: 'Saves', value: totalStats.saves, color: '#ffc658' },
    { name: 'Shares', value: totalStats.shares, color: '#ff7300' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance of your job postings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={dateRange === '7d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setDateRange('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={dateRange === '30d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </Button>
          <Button 
            variant={dateRange === '90d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setDateRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.length} active job{analytics.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.applications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {avgConversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Saves</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.saves.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Saved by job seekers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.shares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Social shares
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="jobs">Job Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Performance Comparison</CardTitle>
                <CardDescription>Views vs Applications for top jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" name="Views" />
                    <Bar dataKey="applications" fill="#82ca9d" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>Breakdown of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates by Job</CardTitle>
              <CardDescription>Application conversion rates for each job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.slice(0, 10).map((job) => (
                  <div key={job.job_id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="font-medium">{job.job_title}</p>
                      <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{job.conversion_rate.toFixed(1)}%</span>
                      <Progress value={job.conversion_rate} className="w-20" />
                    </div>
                    <Badge variant={job.conversion_rate > 5 ? 'default' : job.conversion_rate > 2 ? 'secondary' : 'outline'}>
                      {job.applications} applications
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Job Performance</CardTitle>
              <CardDescription>Detailed analytics for each job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((job) => (
                  <Card key={job.job_id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{job.job_title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                      </div>
                      <Badge variant="outline">
                        {job.conversion_rate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{job.total_views}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applications</p>
                        <p className="font-medium">{job.applications}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saves</p>
                        <p className="font-medium">{job.saves}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Time</p>
                        <p className="font-medium">{Math.round(job.avg_time_on_page / 60)}m</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};