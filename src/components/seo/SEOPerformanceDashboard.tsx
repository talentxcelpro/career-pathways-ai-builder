import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { CoreWebVitalsMonitor } from './CoreWebVitalsMonitor';
import { RSSFeedGenerator } from './RSSFeedGenerator';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Search, 
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Settings,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkJob {
  id: string;
  job_type: string;
  content_type: string;
  status: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  success_rate: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

interface PerformanceData {
  date: string;
  organic_clicks: number;
  organic_impressions: number;
  avg_position: number;
  click_through_rate: number;
}

export const SEOPerformanceDashboard = () => {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [bulkJobs, setBulkJobs] = useState<BulkJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState<BulkJob[]>([]);

  const performanceMetrics = [
    { label: 'Page Load Speed', value: '1.2s', status: 'good' },
    { label: 'Mobile Usability', value: '98%', status: 'good' },
    { label: 'SEO Score', value: '94/100', status: 'good' },
    { label: 'Accessibility', value: '96%', status: 'good' }
  ];

  const seoFeatures = [
    { name: 'Dynamic Sitemaps', status: 'active', description: 'Auto-generated XML sitemaps' },
    { name: 'Structured Data', status: 'active', description: 'JSON-LD markup for jobs & companies' },
    { name: 'AI Meta Tags', status: 'active', description: 'Auto-generated meta titles & descriptions' },
    { name: 'Bulk Processing', status: 'active', description: 'Mass SEO optimization tools' },
    { name: 'Performance Tracking', status: 'active', description: 'Real-time SEO analytics' },
    { name: 'Open Graph Tags', status: 'active', description: 'Social media optimization' },
    { name: 'Image Optimization', status: 'active', description: 'Lazy loading & WebP support' },
    { name: 'RSS Feeds', status: 'active', description: 'Content syndication feeds' }
  ];

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now - will be replaced with real data once types are updated
      const mockPerformanceData = [
        { date: '2025-01-01', organic_clicks: 150, organic_impressions: 2000, avg_position: 5.2, click_through_rate: 7.5 },
        { date: '2025-01-02', organic_clicks: 180, organic_impressions: 2100, avg_position: 4.8, click_through_rate: 8.6 },
        { date: '2025-01-03', organic_clicks: 220, organic_impressions: 2300, avg_position: 4.2, click_through_rate: 9.6 }
      ];
      
      const mockBulkJobs = [
        {
          id: '1',
          job_type: 'meta_generation',
          content_type: 'job',
          status: 'completed',
          total_items: 100,
          processed_items: 100,
          failed_items: 0,
          success_rate: 100,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }
      ];

      setPerformanceData(mockPerformanceData);
      setBulkJobs(mockBulkJobs);
      setActiveJobs(mockBulkJobs.filter(job => ['pending', 'processing'].includes(job.status)));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startBulkMetaGeneration = async (contentType: 'job' | 'company' | 'course') => {
    try {
      const { data, error } = await supabase.functions.invoke('seo-bulk-processor', {
        body: {
          action: 'start',
          jobType: 'meta_generation',
          contentType,
          configuration: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            batchSize: 10
          }
        }
      });

      if (error) throw error;

      // Start background processing
      await supabase.functions.invoke('seo-bulk-processor', {
        body: {
          action: 'process',
          jobId: data.jobId
        }
      });

      toast({
        title: "Bulk Generation Started!",
        description: `Processing ${data.totalItems} ${contentType}s for meta tag generation.`,
      });

      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start bulk generation",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const generateReports = () => {
    console.log('Generating SEO performance report...');
  };

  // Calculate summary stats
  const totalClicks = performanceData.reduce((sum, day) => sum + day.organic_clicks, 0);
  const totalImpressions = performanceData.reduce((sum, day) => sum + day.organic_impressions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const avgPosition = performanceData.length > 0 
    ? performanceData.reduce((sum, day) => sum + day.avg_position, 0) / performanceData.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and optimize your SEO performance</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="bulk-tools">Bulk Tools</TabsTrigger>
          <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <Badge variant={metric.status === 'good' ? 'default' : 'secondary'}>
                      {metric.status === 'good' ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SEO Features Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Features Status
              </CardTitle>
              <CardDescription>
                Current implementation status of advanced SEO features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                      {feature.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <CoreWebVitalsMonitor />

          {/* RSS Feed Generator */}
          <RSSFeedGenerator />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Clicks</span>
                </div>
                <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Impressions</span>
                </div>
                <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Avg CTR</span>
                </div>
                <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Click-through rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Avg Position</span>
                </div>
                <div className="text-2xl font-bold">{avgPosition.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Search ranking</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Performance Trends</CardTitle>
              <CardDescription>Track your organic traffic and search performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="organic_clicks" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Clicks"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="avg_position" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Avg Position"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bulk SEO Tools
              </CardTitle>
              <CardDescription>
                Process thousands of URLs automatically with AI-powered SEO optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Job Listings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate AI-optimized meta tags for all active job postings
                    </p>
                    <Button 
                      onClick={() => startBulkMetaGeneration('job')}
                      className="w-full"
                    >
                      Process Jobs
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Company Profiles</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Optimize company profile meta data for better discoverability
                    </p>
                    <Button 
                      onClick={() => startBulkMetaGeneration('company')}
                      className="w-full"
                    >
                      Process Companies
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Learning Courses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enhance course SEO for maximum reach and enrollment
                    </p>
                    <Button 
                      onClick={() => startBulkMetaGeneration('course')}
                      className="w-full"
                    >
                      Process Courses
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {activeJobs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Active Processing Jobs</h3>
                  {activeJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <span className="font-medium">
                              {job.job_type.replace('_', ' ').toUpperCase()} - {job.content_type}
                            </span>
                            <Badge variant={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {job.processed_items}/{job.total_items}
                          </span>
                        </div>
                        
                        <Progress 
                          value={job.total_items > 0 ? (job.processed_items / job.total_items * 100) : 0} 
                          className="mb-2"
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {new Date(job.created_at).toLocaleString()}</span>
                          <span>Success Rate: {job.success_rate.toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Job History</CardTitle>
              <CardDescription>History of all bulk SEO processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <div className="font-medium">
                          {job.job_type.replace('_', ' ').toUpperCase()} - {job.content_type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleString()}
                        </div>
                        {job.error_message && (
                          <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            {job.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {job.processed_items}/{job.total_items} items
                      </div>
                      {job.success_rate > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {job.success_rate.toFixed(1)}% success
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {bulkJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No processing jobs found. Start your first bulk operation in the Bulk Tools tab!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Advanced Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced SEO Actions
          </CardTitle>
          <CardDescription>
            Advanced tools for SEO optimization and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={generateReports} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate SEO Report
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Test Mobile Usability
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analyze Page Speed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};