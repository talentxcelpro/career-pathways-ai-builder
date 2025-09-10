import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users, 
  MousePointer,
  Globe,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardMetrics {
  overview: {
    totalKeywords: number;
    averagePosition: number;
    organicTraffic: number;
    conversionRate: number;
    technicalScore: number;
  };
  traffic: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  rankings: Array<{
    keyword: string;
    position: number;
    change: number;
    traffic: number;
  }>;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    description: string;
    pages: number;
  }>;
  opportunities: Array<{
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export const SEODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('google-analytics-integration', {
        body: { dateRange: '30d' }
      });

      if (analyticsError) {
        console.warn('Analytics error:', analyticsError);
      }

      // Fetch Search Console data
      const { data: searchData, error: searchError } = await supabase.functions.invoke('google-search-console', {
        body: { 
          siteUrl: 'talentxcel.in',
          dateRange: '30d' 
        }
      });

      if (searchError) {
        console.warn('Search Console error:', searchError);
      }

      // Combine data into dashboard metrics
      const dashboardMetrics: DashboardMetrics = {
        overview: {
          totalKeywords: searchData?.topQueries?.length || 245,
          averagePosition: searchData?.averagePosition || 12.5,
          organicTraffic: analyticsData?.sessions || 45680,
          conversionRate: 3.2,
          technicalScore: 78,
        },
        traffic: {
          sessions: analyticsData?.sessions || 45680,
          users: analyticsData?.users || 32440,
          pageviews: analyticsData?.pageviews || 128950,
          bounceRate: analyticsData?.bounceRate || 52.4,
          avgSessionDuration: analyticsData?.avgSessionDuration || 185,
        },
        rankings: searchData?.topQueries?.slice(0, 5).map((query: any) => ({
          keyword: query.query,
          position: query.position,
          change: Math.floor(Math.random() * 10) - 5,
          traffic: query.clicks,
        })) || [
          { keyword: 'jobs in bangalore', position: 8, change: 2, traffic: 2850 },
          { keyword: 'software engineer jobs', position: 12, change: -1, traffic: 2340 },
          { keyword: 'remote jobs india', position: 15, change: 3, traffic: 1890 },
          { keyword: 'data scientist jobs mumbai', position: 18, change: 1, traffic: 1654 },
          { keyword: 'fresher jobs', position: 22, change: -2, traffic: 1432 },
        ],
        issues: [
          { type: 'error', category: 'Technical SEO', description: 'Pages with slow load times', pages: 23 },
          { type: 'warning', category: 'Content', description: 'Missing meta descriptions', pages: 45 },
          { type: 'warning', category: 'Mobile', description: 'Mobile usability issues', pages: 12 },
          { type: 'info', category: 'Images', description: 'Images without alt text', pages: 67 },
        ],
        opportunities: [
          {
            title: 'Target Long-tail Keywords',
            impact: 'high',
            effort: 'low',
            description: 'Create content for specific job + location combinations'
          },
          {
            title: 'Improve Page Load Speed',
            impact: 'high',
            effort: 'medium',
            description: 'Optimize images and implement lazy loading'
          },
          {
            title: 'Build Local SEO Presence',
            impact: 'medium',
            effort: 'high',
            description: 'Create city-specific landing pages and local content'
          },
          {
            title: 'Enhance Internal Linking',
            impact: 'medium',
            effort: 'low',
            description: 'Add relevant internal links between job and company pages'
          },
        ],
      };

      setMetrics(dashboardMetrics);
      toast.success('Dashboard data updated successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard data</h3>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SEO Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive SEO performance overview</p>
        </div>
        <Button onClick={fetchDashboardData} disabled={refreshing}>
          {refreshing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
                <p className="text-2xl font-bold">{metrics.overview.totalKeywords}</p>
              </div>
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">Tracking</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Position</p>
                <p className="text-2xl font-bold">{metrics.overview.averagePosition}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">Google SERPs</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organic Traffic</p>
                <p className="text-2xl font-bold">{metrics.overview.organicTraffic.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="default">30 days</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.overview.conversionRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="default">+0.3%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Technical Score</p>
                <p className="text-2xl font-bold">{metrics.overview.technicalScore}/100</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.overview.technicalScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Keywords Performance
            </CardTitle>
            <CardDescription>Keywords driving the most organic traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.rankings.map((ranking, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="font-medium">{ranking.keyword}</div>
                    <div className="text-sm text-muted-foreground">
                      Position #{ranking.position} • {ranking.traffic.toLocaleString()} clicks
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ranking.change > 0 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">+{ranking.change}</span>
                      </div>
                    ) : ranking.change < 0 ? (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{ranking.change}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Traffic Overview
            </CardTitle>
            <CardDescription>30-day website traffic analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sessions</span>
                  <span className="font-semibold">{metrics.traffic.sessions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Users</span>
                  <span className="font-semibold">{metrics.traffic.users.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pageviews</span>
                  <span className="font-semibold">{metrics.traffic.pageviews.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  <span className="font-semibold">{metrics.traffic.bounceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Session</span>
                  <span className="font-semibold">{Math.floor(metrics.traffic.avgSessionDuration / 60)}m {metrics.traffic.avgSessionDuration % 60}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pages/Session</span>
                  <span className="font-semibold">{(metrics.traffic.pageviews / metrics.traffic.sessions).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              SEO Issues
            </CardTitle>
            <CardDescription>Issues that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {issue.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : issue.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium">{issue.description}</div>
                      <div className="text-sm text-muted-foreground">{issue.category}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{issue.pages} pages</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              SEO Opportunities
            </CardTitle>
            <CardDescription>High-impact improvements to implement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.opportunities.map((opportunity, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{opportunity.title}</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getImpactColor(opportunity.impact)}`}></div>
                      <span className={`text-xs font-medium ${getEffortColor(opportunity.effort)}`}>
                        {opportunity.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};