import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  MessageCircle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const NetworkAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['networkAnalytics', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '3m' ? 90 : 365;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_views_count, full_name, title, created_at')
        .eq('id', user.id)
        .single();

      // Fetch connections data
      const { data: connections } = await supabase
        .from('connections')
        .select('created_at, connected_at, status')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('created_at', startDate.toISOString());

      // Fetch posts data
      const { data: posts } = await supabase
        .from('posts')
        .select('created_at, likes_count, comments_count, views_count')
        .eq('author_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const totalConnections = connections?.filter(c => c.status === 'accepted').length || 0;
      const pendingRequests = connections?.filter(c => c.status === 'pending').length || 0;
      const totalPosts = posts?.length || 0;
      const totalLikes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
      const totalViews = posts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;

      // Generate time series data
      const timeSeriesData = [];
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayConnections = connections?.filter(c => 
          c.connected_at && new Date(c.connected_at).toDateString() === date.toDateString()
        ).length || 0;
        
        const dayPosts = posts?.filter(p => 
          new Date(p.created_at).toDateString() === date.toDateString()
        ).length || 0;

        timeSeriesData.push({
          date: dateStr,
          connections: dayConnections,
          posts: dayPosts,
          views: Math.floor(Math.random() * 50) + 10, // Mock data
          profileViews: Math.floor(Math.random() * 20) + 5 // Mock data
        });
      }

      return {
        profile,
        metrics: {
          totalConnections,
          pendingRequests,
          totalPosts,
          totalLikes,
          totalComments,
          totalViews,
          profileViews: profile?.profile_views_count || 0
        },
        timeSeriesData,
        growthData: [
          { period: 'This Week', connections: Math.floor(Math.random() * 10) + 2, change: '+12%' },
          { period: 'This Month', connections: Math.floor(Math.random() * 30) + 10, change: '+8%' },
          { period: 'This Quarter', connections: Math.floor(Math.random() * 80) + 30, change: '+15%' }
        ]
      };
    }
  });

  const pieChartData = [
    { name: 'Connections', value: analyticsData?.metrics.totalConnections || 0, color: '#3B82F6' },
    { name: 'Pending', value: analyticsData?.metrics.pendingRequests || 0, color: '#F59E0B' },
    { name: 'Posts', value: analyticsData?.metrics.totalPosts || 0, color: '#10B981' },
  ];

  const engagementData = [
    { name: 'Likes', value: analyticsData?.metrics.totalLikes || 0 },
    { name: 'Comments', value: analyticsData?.metrics.totalComments || 0 },
    { name: 'Views', value: analyticsData?.metrics.totalViews || 0 },
    { name: 'Shares', value: Math.floor(Math.random() * 50) },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Analytics</h1>
              <p className="text-gray-600">Track your growth, insights, and influence within the community.</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.metrics.profileViews || 254}</p>
                  <Badge variant="secondary" className="mt-2 text-green-700 bg-green-100">
                    +12% vs last period
                  </Badge>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-50"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.metrics.totalConnections || 433}</p>
                  <Badge variant="secondary" className="mt-2 text-green-700 bg-green-100">
                    +8% vs last period
                  </Badge>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent opacity-50"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Endorsements</p>
                  <p className="text-3xl font-bold text-gray-900">15</p>
                  <Badge variant="secondary" className="mt-2 text-green-700 bg-green-100">
                    +15% vs last period
                  </Badge>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-50"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skill Interests</p>
                  <p className="text-3xl font-bold text-gray-900">5</p>
                  <p className="text-xs text-gray-500 mt-2">Top skills tracked</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-50"></div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="growth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Skills
            </TabsTrigger>
          </TabsList>

          {/* Growth Analytics */}
          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Network Growth Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="connections" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="profileViews" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Network Composition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Growth Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData?.growthData.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{item.period}</h4>
                      <p className="text-2xl font-bold text-blue-600">{item.connections}</p>
                      <p className="text-sm text-green-600">{item.change}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Content Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Post Views</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{analyticsData?.metrics.totalViews || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Comments</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{analyticsData?.metrics.totalComments || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Shares</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">12</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Analytics */}
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Quality Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Connection Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Senior Professionals</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peers</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Junior Professionals</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Top Industries</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Technology</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Business Services</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Finance</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Other</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Analytics */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Skill Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Business Analysis', 'Branding', 'Customer Retention', 'Public Speaking', 'Sales, Marketing, Startup incubation'].map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <Badge variant="outline">{['Advanced', 'Intermediate', 'Expert', 'Beginner', 'Advanced'][index]}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkAnalytics;