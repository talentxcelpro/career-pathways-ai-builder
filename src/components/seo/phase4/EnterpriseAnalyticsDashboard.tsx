import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Globe, 
  Target, 
  Users, 
  BarChart3, 
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-analytics-integration', {
        body: {
          propertyId: 'GA_PROPERTY_ID',
          dateRange: {
            startDate: '30daysAgo',
            endDate: 'today'
          },
          metrics: ['sessions', 'users', 'pageviews', 'bounceRate']
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setAnalyticsData(data.data);
        toast.success('Analytics data updated successfully!');
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics data');
      // Set mock data for demo
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const getMockAnalyticsData = () => ({
    summary: {
      totalSessions: 125000,
      totalUsers: 98000,
      totalPageViews: 320000,
      bounceRate: 0.42,
      avgSessionDuration: 185,
      conversionRate: 0.058
    },
    topPages: [
      { page: '/jobs', pageViews: 80000, uniquePageViews: 65000, avgTimeOnPage: 180, bounceRate: 0.35, exitRate: 0.25 },
      { page: '/resume-builder', pageViews: 64000, uniquePageViews: 52000, avgTimeOnPage: 300, bounceRate: 0.28, exitRate: 0.20 },
      { page: '/career-guidance', pageViews: 48000, uniquePageViews: 38000, avgTimeOnPage: 220, bounceRate: 0.32, exitRate: 0.22 }
    ],
    trafficSources: [
      { source: 'google', medium: 'organic', sessions: 56250, users: 45000, conversionRate: 0.072 },
      { source: 'direct', medium: '(none)', sessions: 31250, users: 28000, conversionRate: 0.095 },
      { source: 'linkedin', medium: 'social', sessions: 18750, users: 16000, conversionRate: 0.068 }
    ]
  });

  const data = analyticsData || getMockAnalyticsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Enterprise Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive SEO and business intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          <Button 
            onClick={fetchAnalyticsData} 
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Sessions', value: data.summary.totalSessions.toLocaleString(), change: '+28%', icon: Users, positive: true },
          { label: 'Total Users', value: data.summary.totalUsers.toLocaleString(), change: '+32%', icon: Target, positive: true },
          { label: 'Page Views', value: data.summary.totalPageViews.toLocaleString(), change: '+25%', icon: BarChart3, positive: true },
          { label: 'Bounce Rate', value: (data.summary.bounceRate * 100).toFixed(1) + '%', change: '-5%', icon: TrendingUp, positive: true },
          { label: 'Avg Session', value: Math.round(data.summary.avgSessionDuration) + 's', change: '+15%', icon: Activity, positive: true },
          { label: 'Conversion Rate', value: (data.summary.conversionRate * 100).toFixed(1) + '%', change: '+12%', icon: Zap, positive: true }
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
                <CardDescription>Pages driving the most engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPages.map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-muted-foreground">
                          {page.pageViews.toLocaleString()} views • {Math.round(page.avgTimeOnPage)}s avg time
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{(page.bounceRate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">bounce rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources Performance</CardTitle>
                <CardDescription>Conversion rates by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.trafficSources.map((source: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium capitalize">{source.source} / {source.medium}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.sessions.toLocaleString()} sessions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{(source.conversionRate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">conversion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="international">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International SEO Performance
              </CardTitle>
              <CardDescription>Multi-language and regional performance analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">International Analytics Ready</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your international SEO settings to view regional performance data
                </p>
                <Button>Configure International Tracking</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SEO Automation Status
              </CardTitle>
              <CardDescription>Automated tasks and scheduled reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Daily Technical Audit', status: 'Active', nextRun: '09:00 tomorrow', success: 98 },
                  { name: 'Weekly Keyword Tracking', status: 'Active', nextRun: 'Monday 08:00', success: 95 },
                  { name: 'Monthly Competitor Analysis', status: 'Active', nextRun: 'Feb 1st 10:00', success: 92 }
                ].map((automation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-muted-foreground">Next run: {automation.nextRun}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{automation.success}% success rate</div>
                        <Progress value={automation.success} className="w-20" />
                      </div>
                      <Badge variant={automation.status === 'Active' ? 'default' : 'secondary'}>
                        {automation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Reporting Suite</CardTitle>
              <CardDescription>Custom reports and automated delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Executive Summary', description: 'High-level performance overview', frequency: 'Weekly' },
                  { title: 'Technical Deep Dive', description: 'Detailed technical analysis', frequency: 'Monthly' },
                  { title: 'Competitor Intelligence', description: 'Market position analysis', frequency: 'Monthly' }
                ].map((report, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{report.frequency}</Badge>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>
                    </CardContent>
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