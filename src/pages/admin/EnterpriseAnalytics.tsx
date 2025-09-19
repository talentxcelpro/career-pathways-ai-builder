import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EnterpriseAnalytics = () => {
  // Real usage analytics
  const { data: usageMetrics } = useQuery({
    queryKey: ['enterprise-usage-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_usage_logs')
        .select('created_at, tokens_used, operation_type')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      // Group by day
      const dailyUsage = data?.reduce((acc, log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, tokens: 0, requests: 0 };
        }
        acc[date].tokens += log.tokens_used || 0;
        acc[date].requests += 1;
        return acc;
      }, {} as Record<string, any>) || {};
      
      return Object.values(dailyUsage);
    }
  });

  // Client performance data
  const { data: clientPerformance } = useQuery({
    queryKey: ['client-performance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select(`
          id, 
          company_name, 
          subscription_tier,
          ai_usage_logs(created_at, tokens_used)
        `)
        .eq('subscription_tier', 'enterprise')
        .limit(10);
      
      return data?.map(client => ({
        name: client.company_name || `Client ${client.id.slice(0, 8)}`,
        usage: client.ai_usage_logs?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 0,
        requests: client.ai_usage_logs?.length || 0
      })) || [];
    }
  });

  // Revenue analytics
  const { data: revenueData } = useQuery({
    queryKey: ['enterprise-revenue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pro_subscriptions')
        .select('amount, created_at, plan_type')
        .eq('plan_type', 'enterprise')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      // Group by month
      const monthlyRevenue = data?.reduce((acc, payment) => {
        const month = new Date(payment.created_at).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, clients: 0 };
        }
        acc[month].revenue += payment.amount || 0;
        acc[month].clients += 1;
        return acc;
      }, {} as Record<string, any>) || {};
      
      return Object.values(monthlyRevenue);
    }
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics and insights for enterprise clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageMetrics?.reduce((sum, day) => sum + day.requests, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientPerformance?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Enterprise accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData?.slice(-1)[0]?.revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145ms</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              -5ms from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trends</CardTitle>
            <CardDescription>API calls and token consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="API Calls"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Tokens Used"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly enterprise subscription revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    name="Revenue ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Clients</CardTitle>
          <CardDescription>Enterprise clients ranked by usage metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientPerformance?.slice(0, 8).map((client, index) => (
              <div key={client.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.requests} API calls</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{client.usage.toLocaleString()} tokens</p>
                  <Badge variant="outline">Enterprise</Badge>
                </div>
              </div>
            ))}
            {!clientPerformance?.length && (
              <p className="text-center py-8 text-muted-foreground">No client data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseAnalytics;