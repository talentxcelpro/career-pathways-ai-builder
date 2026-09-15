import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Target, 
  Eye, 
  Link,
  FileText,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const SEOSuite = () => {
  // Fetch SEO performance data
  const { data: seoMetrics } = useQuery({
    queryKey: ['seo-metrics'],
    queryFn: async () => {
      const [jobsData, seoContentData, analyticsData] = await Promise.all([
        supabase.from('jobs').select('id, seo_slug, views_count, created_at').eq('is_active', true),
        supabase.from('seo_content_cache').select('*'),
        supabase.from('seo_metadata').select('*')
      ]);

      const totalPages = jobsData.data?.length || 0;
      const totalViews = jobsData.data?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;
      const avgViews = totalPages > 0 ? Math.round(totalViews / totalPages) : 0;
      const seoOptimized = jobsData.data?.filter(job => job.seo_slug).length || 0;
      const optimizationRate = totalPages > 0 ? Math.round((seoOptimized / totalPages) * 100) : 0;

      return {
        totalPages,
        totalViews,
        avgViews,
        seoOptimized,
        optimizationRate,
        cachedContent: seoContentData.data?.length || 0,
        metadataEntries: analyticsData.data?.length || 0
      };
    }
  });

  // Fetch traffic trends (simulated data for now)
  const { data: trafficTrends } = useQuery({
    queryKey: ['seo-traffic-trends'],
    queryFn: async () => {
      // In a real implementation, this would come from Google Analytics API or similar
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Generate sample data for the last 30 days
      const trends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        trends.push({
          date: date.toISOString().split('T')[0],
          organic_traffic: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 200) + 100,
          impressions: Math.floor(Math.random() * 5000) + 2000,
          ctr: Math.random() * 0.1 + 0.02
        });
      }
      
      return trends;
    }
  });

  // Fetch top performing pages
  const { data: topPages } = useQuery({
    queryKey: ['top-seo-pages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select('id, title, seo_slug, views_count, applications_count')
        .eq('is_active', true)
        .order('views_count', { ascending: false })
        .limit(10);
      
      return data || [];
    }
  });

  const metrics = seoMetrics || {
    totalPages: 0,
    totalViews: 0,
    avgViews: 0,
    seoOptimized: 0,
    optimizationRate: 0,
    cachedContent: 0,
    metadataEntries: 0
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Suite</h1>
          <p className="text-muted-foreground">
            Advanced SEO tools and analytics for job portal optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            SEO Settings
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Optimize All
          </Button>
        </div>
      </div>

      {/* SEO Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active job pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Optimized</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.seoOptimized}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.optimizationRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">{metrics.optimizationRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg {metrics.avgViews} views per page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cachedContent}</div>
            <p className="text-xs text-muted-foreground">Cached content items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Traffic Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Organic Traffic Trends
            </CardTitle>
            <CardDescription>30-day organic search performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toLocaleString() : value, 
                      name === 'organic_traffic' ? 'Organic Traffic' : 
                      name === 'clicks' ? 'Clicks' : 
                      name === 'impressions' ? 'Impressions' : 'CTR'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="organic_traffic" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary)/0.3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Click-Through Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Search Performance
            </CardTitle>
            <CardDescription>Clicks and impressions from search results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Clicks"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Impressions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Top Performing Pages
          </CardTitle>
          <CardDescription>Pages with highest organic traffic and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPages?.map((page, index) => (
              <div key={page.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium truncate max-w-[300px]">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">/{page.seo_slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{(page.views_count || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{(page.applications_count || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">applications</p>
                  </div>
                  <Badge variant="outline">
                    {page.seo_slug ? 'Optimized' : 'Needs SEO'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!topPages?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No page data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Keyword Research</CardTitle>
            <CardDescription>Find high-value keywords for job content</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Link className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Backlink Analysis</CardTitle>
            <CardDescription>Monitor and build quality backlinks</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Site Audit</CardTitle>
            <CardDescription>Comprehensive SEO health check</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Rank Tracking</CardTitle>
            <CardDescription>Monitor keyword position rankings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default SEOSuite;