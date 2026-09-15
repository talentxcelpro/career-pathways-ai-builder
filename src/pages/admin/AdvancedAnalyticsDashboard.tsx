import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, Zap, Activity, Globe, Download, Filter } from 'lucide-react';

const AdvancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data - replace with real data from useAdvancedAdmin hook
  const kpiData = [
    { title: 'Total Page Views', value: '2.4M', change: '+12.5%', trend: 'up', icon: Eye },
    { title: 'Unique Visitors', value: '847K', change: '+8.2%', trend: 'up', icon: Users },
    { title: 'Conversion Rate', value: '3.4%', change: '-2.1%', trend: 'down', icon: Zap },
    { title: 'Avg. Session Duration', value: '4m 32s', change: '+15.3%', trend: 'up', icon: Activity }
  ];

  const trafficData = [
    { date: '2024-01-01', organic: 4000, direct: 2400, social: 1600, referral: 800 },
    { date: '2024-01-02', organic: 3000, direct: 1398, social: 1200, referral: 900 },
    { date: '2024-01-03', organic: 2000, direct: 9800, social: 1800, referral: 1200 },
    { date: '2024-01-04', organic: 2780, direct: 3908, social: 1400, referral: 1000 },
    { date: '2024-01-05', organic: 1890, direct: 4800, social: 1600, referral: 1100 },
    { date: '2024-01-06', organic: 2390, direct: 3800, social: 1900, referral: 1300 },
    { date: '2024-01-07', organic: 3490, direct: 4300, social: 2100, referral: 1400 }
  ];

  const pagePerformance = [
    { page: '/jobs', views: 15420, bounceRate: 32, avgTime: '3:45' },
    { page: '/companies', views: 12380, bounceRate: 28, avgTime: '4:12' },
    { page: '/resume-builder', views: 9850, bounceRate: 25, avgTime: '6:23' },
    { page: '/career-advice', views: 8920, bounceRate: 45, avgTime: '2:18' },
    { page: '/courses', views: 7650, bounceRate: 38, avgTime: '3:02' }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 28, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 7, color: 'hsl(var(--accent))' }
  ];

  const realtimeData = [
    { metric: 'Active Users', value: '1,247', change: '+23' },
    { metric: 'Page Views/min', value: '89', change: '+12' },
    { metric: 'New Sessions', value: '156', change: '+8' },
    { metric: 'Bounce Rate', value: '32%', change: '-2%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Website traffic trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                    <Area type="monotone" dataKey="direct" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" />
                    <Area type="monotone" dataKey="social" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" />
                    <Area type="monotone" dataKey="referral" stackId="1" stroke="hsl(var(--muted))" fill="hsl(var(--muted))" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User device preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {deviceData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources Breakdown</CardTitle>
              <CardDescription>Detailed analysis of traffic sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="organic" fill="hsl(var(--primary))" />
                  <Bar dataKey="direct" fill="hsl(var(--secondary))" />
                  <Bar dataKey="social" fill="hsl(var(--accent))" />
                  <Bar dataKey="referral" fill="hsl(var(--muted))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Page performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagePerformance.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{page.page}</p>
                      <p className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Bounce Rate</p>
                        <p className="font-medium">{page.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Time</p>
                        <p className="font-medium">{page.avgTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>User interaction patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Page Depth</span>
                    <Badge variant="secondary">2.4 pages/session</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Return Visitors</span>
                    <Badge variant="secondary">34%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time on Site</span>
                    <Badge variant="secondary">4m 32s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top countries by traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'].map((country, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{country}</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 30 + 10)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {realtimeData.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-500">{metric.change}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['New user signed up', 'Job application submitted', 'Resume downloaded', 'Course enrollment', 'Company profile viewed'].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm">{activity}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Just now</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;