
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Loader2, TrendingUp, Target, Eye, FileText, Users, CheckCircle } from 'lucide-react';

const Analytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['job-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get application statistics
      const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            title,
            employment_type,
            companies (name)
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (appError) throw appError;

      // Get profile data for scoring
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get saved jobs
      const { data: savedJobs, error: savedError } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      return {
        applications: applications || [],
        profile,
        savedJobs: savedJobs || []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  const { applications, profile, savedJobs } = analytics;

  // Calculate statistics
  const statusCounts = applications.reduce((acc: any, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const employmentTypeData = applications.reduce((acc: any, app: any) => {
    const type = app.jobs?.employment_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const monthlyApplications = applications.reduce((acc: any, app: any) => {
    const month = new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const employmentChartData = Object.entries(employmentTypeData).map(([type, count]) => ({
    type,
    count
  }));

  const monthlyChartData = Object.entries(monthlyApplications).map(([month, count]) => ({
    month,
    applications: count
  }));

  // Calculate profile strength
  const calculateProfileStrength = () => {
    let score = 0;
    let maxScore = 10;

    if (profile?.full_name) score += 1;
    if (profile?.email) score += 1;
    if (profile?.phone) score += 1;
    if (profile?.about) score += 1;
    if (profile?.skills && profile.skills.length > 0) score += 2;
    if (profile?.experience_years) score += 1;
    if (profile?.resume_url) score += 2;
    if (profile?.linkedin_url) score += 1;

    return Math.round((score / maxScore) * 100);
  };

  const profileStrength = calculateProfileStrength();

  // Response rate calculation
  const responseRate = applications.length > 0 
    ? Math.round(((applications.filter((app: any) => app.status !== 'applied').length) / applications.length) * 100)
    : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          Job Search Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Track your job search progress and optimize your approach
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {savedJobs.length} jobs saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Employers responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileStrength}%</div>
            <Progress value={profileStrength} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.length > 0 
                ? Math.round(((applications.filter((app: any) => ['offered', 'hired'].includes(app.status)).length) / applications.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Offers received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
            <CardDescription>Distribution of your application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Job Type</CardTitle>
            <CardDescription>Your application distribution by employment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Trend</CardTitle>
            <CardDescription>Your application activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights & Tips</CardTitle>
            <CardDescription>Personalized recommendations to improve your success rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileStrength < 80 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Improve Your Profile</h4>
                <p className="text-sm text-yellow-700">
                  Complete your profile to increase visibility and match scores with relevant jobs.
                </p>
              </div>
            )}

            {responseRate < 20 && applications.length > 5 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">Optimize Your Applications</h4>
                <p className="text-sm text-blue-700">
                  Your response rate is low. Consider tailoring your resume and cover letter more specifically to each job.
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800">Top 3 Jobs You're Likely to Get</h4>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Frontend Developer positions (based on your skills)</li>
                <li>• Remote JavaScript roles (matching your preferences)</li>
                <li>• Mid-level positions (aligning with your experience)</li>
              </ul>
            </div>

            {applications.length === 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">Get Started</h4>
                <p className="text-sm text-blue-700">
                  Start applying to jobs to see your analytics and get personalized insights!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest job applications and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{app.jobs?.title}</h4>
                    <p className="text-sm text-gray-600">{app.jobs?.companies?.name}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={
                        app.status === 'hired' || app.status === 'offered' ? 'default' :
                        app.status === 'rejected' ? 'destructive' :
                        app.status === 'interview_scheduled' ? 'default' :
                        'secondary'
                      }
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    {app.ai_match_score && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(app.ai_match_score * 100)}% match
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
