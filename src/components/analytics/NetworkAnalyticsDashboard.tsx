import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const mockEngagementData = [
  { date: '2024-01-01', posts: 12, likes: 156, comments: 43, shares: 28, views: 1200 },
  { date: '2024-01-02', posts: 15, likes: 189, comments: 52, shares: 34, views: 1450 },
  { date: '2024-01-03', posts: 8, likes: 98, comments: 29, shares: 19, views: 980 },
  { date: '2024-01-04', posts: 18, likes: 234, comments: 67, shares: 45, views: 1680 },
  { date: '2024-01-05', posts: 22, likes: 298, comments: 78, shares: 52, views: 1920 },
  { date: '2024-01-06', posts: 14, likes: 167, comments: 41, shares: 29, views: 1340 },
  { date: '2024-01-07', posts: 19, likes: 245, comments: 63, shares: 38, views: 1780 },
];

const mockConnectionsData = [
  { month: 'Jan', connections: 45, requests_sent: 23, requests_received: 31 },
  { month: 'Feb', connections: 67, requests_sent: 34, requests_received: 42 },
  { month: 'Mar', connections: 89, requests_sent: 45, requests_received: 56 },
  { month: 'Apr', connections: 123, requests_sent: 67, requests_received: 78 },
  { month: 'May', connections: 156, requests_sent: 89, requests_received: 94 },
  { month: 'Jun', connections: 198, requests_sent: 112, requests_received: 123 },
];

const mockContentPerformance = [
  { type: 'Article', engagement: 85, reach: 1200 },
  { type: 'Image Post', engagement: 92, reach: 1800 },
  { type: 'Video', engagement: 78, reach: 2400 },
  { type: 'Poll', engagement: 65, reach: 890 },
  { type: 'Text Post', engagement: 58, reach: 1100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend = 'neutral' }) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs ${getTrendColor(trend)}`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const NetworkAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('engagement');

  // Fetch user engagement metrics
  const { data: userMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['user-engagement-metrics', timeRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      const { data, error } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .gte('engagement_date', startDate.toISOString().split('T')[0])
        .order('engagement_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch network analytics
  const { data: networkMetrics, isLoading: isLoadingNetwork } = useQuery({
    queryKey: ['network-analytics', timeRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      const { data, error } = await supabase
        .from('network_analytics')
        .select('*')
        .gte('analytics_date', startDate.toISOString().split('T')[0])
        .order('analytics_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const exportData = async (format: 'csv' | 'pdf') => {
    // Implementation for data export
    console.log(`Exporting data as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Analytics</h2>
          <p className="text-muted-foreground">
            Track your network growth and engagement metrics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Connections"
          value="1,234"
          change="+12% from last week"
          trend="up"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Profile Views"
          value="5,678"
          change="+8% from last week"
          trend="up"
          icon={<Eye className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Post Engagement"
          value="892"
          change="+23% from last week"
          trend="up"
          icon={<Heart className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Content Reach"
          value="12.5K"
          change="+15% from last week"
          trend="up"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="network">Network Growth</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="comments" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Likes', value: 1567, color: '#8884d8' },
                        { name: 'Comments', value: 456, color: '#82ca9d' },
                        { name: 'Shares', value: 298, color: '#ffc658' },
                        { name: 'Views', value: 12340, color: '#ff7c7c' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockConnectionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="connections" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="requests_sent" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="requests_received" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockContentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8884d8" />
                  <Bar dataKey="reach" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <Badge variant="secondary">Growth Opportunity</Badge>
                  </div>
                  <p className="text-sm">
                    Your video content performs 35% better than other post types. 
                    Consider creating more video content to increase engagement.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <Badge variant="secondary">Network Insight</Badge>
                  </div>
                  <p className="text-sm">
                    You have strong connections in the tech industry. 
                    Engaging more with AI and data science content could expand your reach.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <Badge variant="secondary">Timing Insight</Badge>
                  </div>
                  <p className="text-sm">
                    Your posts get 42% more engagement when published between 9-11 AM. 
                    Consider scheduling your content during these peak hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Connect with AI professionals</p>
                    <p className="text-xs text-muted-foreground">15 relevant suggestions</p>
                  </div>
                  <Button size="sm">View</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Join data science groups</p>
                    <p className="text-xs text-muted-foreground">8 active communities</p>
                  </div>
                  <Button size="sm">Explore</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Optimize posting schedule</p>
                    <p className="text-xs text-muted-foreground">Based on engagement data</p>
                  </div>
                  <Button size="sm">Setup</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};