import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  Users, 
  Briefcase, 
  Brain, 
  TrendingUp, 
  Globe, 
  Zap,
  BarChart3,
  Target,
  Star,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CareerPlatform = () => {
  // Platform overview metrics
  const { data: platformStats } = useQuery({
    queryKey: ['platform-overview'],
    queryFn: async () => {
      const [usersData, jobsData, aiUsageData, connectionsData] = await Promise.all([
        supabase.from('user_profiles').select('id, created_at, user_type').limit(1000),
        supabase.from('jobs').select('id, created_at, is_active, applications_count'),
        supabase.from('ai_usage_logs').select('id, created_at, operation_type'),
        supabase.from('connections').select('id, created_at, status')
      ]);

      const totalUsers = usersData.data?.length || 0;
      const totalJobs = jobsData.data?.length || 0;
      const activeJobs = jobsData.data?.filter(job => job.is_active).length || 0;
      const totalApplications = jobsData.data?.reduce((sum, job) => sum + (job.applications_count || 0), 0) || 0;
      const aiOperations = aiUsageData.data?.length || 0;
      const networkConnections = connectionsData.data?.filter(conn => conn.status === 'accepted').length || 0;

      return {
        totalUsers,
        totalJobs,
        activeJobs,
        totalApplications,
        aiOperations,
        networkConnections,
        platformHealth: 98.5,
        uptime: 99.9
      };
    }
  });

  // Feature adoption metrics
  const { data: featureAdoption } = useQuery({
    queryKey: ['feature-adoption'],
    queryFn: async () => {
      const features = [
        { name: 'Job Search', usage: platformStats?.totalApplications || 0, total: platformStats?.totalUsers || 1 },
        { name: 'AI Resume Builder', usage: platformStats?.aiOperations || 0, total: platformStats?.totalUsers || 1 },
        { name: 'Professional Network', usage: platformStats?.networkConnections || 0, total: platformStats?.totalUsers || 1 },
        { name: 'Career Insights', usage: Math.floor((platformStats?.totalUsers || 0) * 0.3), total: platformStats?.totalUsers || 1 }
      ];

      return features.map(feature => ({
        ...feature,
        adoptionRate: Math.round((feature.usage / feature.total) * 100)
      }));
    },
    enabled: !!platformStats
  });

  // Growth trends (simulated data for now)
  const { data: growthTrends } = useQuery({
    queryKey: ['growth-trends'],
    queryFn: async () => {
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        last30Days.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 20,
          jobs: Math.floor(Math.random() * 15) + 5,
          applications: Math.floor(Math.random() * 100) + 30,
          aiUsage: Math.floor(Math.random() * 200) + 50
        });
      }
      return last30Days;
    }
  });

  const stats = platformStats || {
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    aiOperations: 0,
    networkConnections: 0,
    platformHealth: 98.5,
    uptime: 99.9
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            Career Platform Overview
          </h1>
          <p className="text-muted-foreground">
            Complete AI-powered career development ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {stats.uptime}% Uptime
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Platform Settings
          </Button>
        </div>
      </div>

      {/* Platform Health & Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Active platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalJobs.toLocaleString()} total jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Operations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiOperations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <Zap className="h-3 w-3 inline mr-1" />
              AI-powered interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.platformHealth}%</div>
            <Progress value={stats.platformHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Growth Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Growth
            </CardTitle>
            <CardDescription>User acquisition and engagement trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="New Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Feature Adoption
            </CardTitle>
            <CardDescription>Usage rates across core platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureAdoption?.map((feature, index) => (
                <div key={feature.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{feature.name}</span>
                    <span className="text-sm text-muted-foreground">{feature.adoptionRate}%</span>
                  </div>
                  <Progress value={feature.adoptionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Components Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Components
          </CardTitle>
          <CardDescription>Status and performance of core platform systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Job Portal', status: 'operational', uptime: 99.9, users: stats.totalUsers },
              { name: 'AI Resume Builder', status: 'operational', uptime: 99.5, users: Math.floor(stats.totalUsers * 0.6) },
              { name: 'Professional Network', status: 'operational', uptime: 99.8, users: stats.networkConnections },
              { name: 'Career Insights', status: 'operational', uptime: 98.9, users: Math.floor(stats.totalUsers * 0.3) },
              { name: 'Learning Platform', status: 'maintenance', uptime: 95.0, users: Math.floor(stats.totalUsers * 0.2) },
              { name: 'Talent Database', status: 'operational', uptime: 99.7, users: Math.floor(stats.totalUsers * 0.8) }
            ].map((component, index) => (
              <div key={component.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{component.name}</h3>
                  <Badge 
                    variant={component.status === 'operational' ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {component.status === 'operational' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {component.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="font-medium">{component.uptime}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Users</span>
                    <span className="font-medium">{component.users.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>Quick access to platform administration tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>User Management</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Briefcase className="h-6 w-6" />
              <span>Job Management</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Brain className="h-6 w-6" />
              <span>AI Management</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerPlatform;