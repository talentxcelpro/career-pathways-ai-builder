import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  Share2, 
  Briefcase,
  Calendar,
  Users,
  Target,
  Filter
} from "lucide-react";
import { useResumeAnalytics } from '@/hooks/useResumeAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsDashboardProps {
  resumeId: string;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-xs flex items-center mt-1 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="h-8 w-8 text-muted-foreground">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsDashboard = ({ resumeId }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('7d');
  const { metrics, events, isLoading } = useResumeAnalytics(resumeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resume Analytics</h2>
          <p className="text-muted-foreground">
            Track your resume's performance and engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={metrics.totalViews}
          change="+12% vs last week"
          trend="up"
          icon={<Eye className="h-8 w-8" />}
        />
        <MetricCard
          title="Downloads"
          value={metrics.totalDownloads}
          change="+8% vs last week"
          trend="up"
          icon={<Download className="h-8 w-8" />}
        />
        <MetricCard
          title="Shares"
          value={metrics.totalShares}
          change="+5% vs last week"
          trend="up"
          icon={<Share2 className="h-8 w-8" />}
        />
        <MetricCard
          title="Application Rate"
          value={`${metrics.applicationRate.toFixed(1)}%`}
          change="+2.3% vs last week"
          trend="up"
          icon={<Briefcase className="h-8 w-8" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Activity Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="downloads" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Downloads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events?.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Resume {event.event_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.source && `via ${event.source}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Traffic Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.topSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="source"
                      >
                        {metrics.topSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Sources List */}
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <Badge variant="secondary">{source.count} visits</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Views to Downloads</span>
                    <Badge variant="outline">
                      {metrics.totalViews > 0 ? ((metrics.totalDownloads / metrics.totalViews) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads to Applications</span>
                    <Badge variant="outline">
                      {metrics.totalDownloads > 0 ? ((metrics.applicationRate / 100) * metrics.totalViews / metrics.totalDownloads * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Application to Interview</span>
                    <Badge variant="outline">{metrics.interviewRate.toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {Math.round((metrics.applicationRate + metrics.interviewRate) / 2)}
                    </div>
                    <p className="text-muted-foreground">Overall Performance Score</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Views</span>
                      <span className="font-medium">{metrics.totalViews > 50 ? 'Excellent' : metrics.totalViews > 20 ? 'Good' : 'Needs Improvement'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversion</span>
                      <span className="font-medium">{metrics.applicationRate > 5 ? 'Excellent' : metrics.applicationRate > 2 ? 'Good' : 'Needs Improvement'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interview Rate</span>
                      <span className="font-medium">{metrics.interviewRate > 10 ? 'Excellent' : metrics.interviewRate > 5 ? 'Good' : 'Needs Improvement'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Views', value: metrics.totalViews, percentage: 100 },
                      { name: 'Downloads', value: metrics.totalDownloads, percentage: (metrics.totalDownloads / metrics.totalViews) * 100 },
                      { name: 'Applications', value: Math.round(metrics.totalViews * metrics.applicationRate / 100), percentage: metrics.applicationRate },
                      { name: 'Interviews', value: Math.round(metrics.totalViews * metrics.applicationRate * metrics.interviewRate / 10000), percentage: metrics.interviewRate }
                    ]}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};