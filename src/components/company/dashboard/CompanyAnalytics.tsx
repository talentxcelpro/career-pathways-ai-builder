import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  FileText, 
  Calendar,
  Download,
  Filter,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CompanyAnalyticsProps {
  company: any;
  metrics: any;
  userRole: string;
}

export const CompanyAnalytics: React.FC<CompanyAnalyticsProps> = ({ company, metrics, userRole }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsTab, setAnalyticsTab] = useState('overview');

  // Get analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['company-analytics', company?.id, timeRange],
    queryFn: async () => {
      if (!company) return null;

      // Get view analytics
      const { data: viewsData } = await supabase
        .from('analytics_company_views')
        .select('*')
        .eq('company_id', company.id)
        .gte('view_date', new Date(Date.now() - (parseInt(timeRange) || 30) * 24 * 60 * 60 * 1000).toISOString())
        .order('view_date', { ascending: false });

      // Get post engagement
      const { data: postEngagement } = await supabase
        .from('analytics_post_engagement')
        .select(`
          *,
          company_posts!inner(company_id)
        `)
        .eq('company_posts.company_id', company.id)
        .gte('engagement_date', new Date(Date.now() - (parseInt(timeRange) || 30) * 24 * 60 * 60 * 1000).toISOString())
        .order('engagement_date', { ascending: false });

      // Get job analytics
      const { data: jobAnalytics } = await supabase
        .from('analytics_job_stats')
        .select(`
          *,
          jobs!inner(company_id)
        `)
        .eq('jobs.company_id', company.id)
        .gte('stat_date', new Date(Date.now() - (parseInt(timeRange) || 30) * 24 * 60 * 60 * 1000).toISOString())
        .order('stat_date', { ascending: false });

      return {
        views: viewsData || [],
        engagement: postEngagement || [],
        jobs: jobAnalytics || []
      };
    },
    enabled: !!company
  });

  // Calculate growth metrics
  const calculateGrowth = (data: any[], field: string) => {
    if (!data || data.length < 2) return 0;
    const current = data[0]?.[field] || 0;
    const previous = data[1]?.[field] || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
          <p className="text-gray-600">Comprehensive insights into your company performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {analyticsData?.views.reduce((sum, view) => sum + view.total_views, 0) || 0}
            </div>
            <p className="text-xs text-blue-600">
              +{calculateGrowth(analyticsData?.views || [], 'total_views')}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Engagement Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{metrics?.engagement_rate || 0}%</div>
            <p className="text-xs text-green-600">Above industry average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Application Rate</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {analyticsData?.jobs.reduce((sum, job) => sum + job.applications_count, 0) || 0}
            </div>
            <p className="text-xs text-purple-600">Total applications received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {analyticsData?.jobs.reduce((sum, job) => sum + job.conversion_rate, 0) || 0}%
            </div>
            <p className="text-xs text-orange-600">Application to hire rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Growth Trends
                  </CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Follower Growth</span>
                        <span className="text-green-600">+12%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Views</span>
                        <span className="text-blue-600">+24%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Rate</span>
                        <span className="text-purple-600">+8%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Job Applications</span>
                        <span className="text-orange-600">+18%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Top Performing Content
                  </CardTitle>
                  <CardDescription>Your best engaging posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Company Culture Update</h4>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>1,234 views</span>
                        <span>89 likes</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">New Product Launch</h4>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>987 views</span>
                        <span>67 likes</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Team Achievement</h4>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>756 views</span>
                        <span>54 likes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Comprehensive overview of your company metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-xl text-blue-900">Audience Reach</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics?.brand_reach || 0}
                    </p>
                    <p className="text-sm text-gray-600">Monthly impressions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Target className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-xl text-green-900">Success Rate</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {metrics?.success_rate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Hiring success rate</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Zap className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-xl text-purple-900">Engagement</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {metrics?.avg_engagement || 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg. interactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience Analytics</CardTitle>
              <CardDescription>Understand your audience demographics and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Audience Analytics Coming Soon</h3>
                <p className="text-gray-600">Track demographics, locations, and engagement patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Analyze your content strategy effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Content Analytics Coming Soon</h3>
                <p className="text-gray-600">Track post performance, optimal timing, and engagement rates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Analytics Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Analytics</CardTitle>
              <CardDescription>Detailed insights into your hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Job Analytics Coming Soon</h3>
                <p className="text-gray-600">Track application rates, source attribution, and hiring funnel performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};