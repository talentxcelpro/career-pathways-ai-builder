import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  FileText, 
  Activity, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface SEOMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_category: string;
  status: string;
  details: any;
  updated_at: string;
}

interface AutomationStatus {
  last_run: string;
  next_run: string;
  success_rate: number;
  total_runs: number;
}

export const SEODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [automation, setAutomation] = useState<AutomationStatus | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSEOMetrics();
    loadAutomationStatus();
  }, []);

  const loadSEOMetrics = async () => {
    try {
      // Try to get from seo_monitoring table first, fallback to platform_metrics
      let { data: seoData, error: seoError } = await supabase
        .from('seo_monitoring')
        .select('*')
        .order('updated_at', { ascending: false });

      if (seoError) {
        // Fallback to platform_metrics
        const { data: platformData, error: platformError } = await supabase
          .from('platform_metrics')
          .select('*')
          .eq('metric_category', 'seo')
          .order('period_start', { ascending: false });

        if (platformError) throw platformError;
        
        // Transform platform_metrics to match SEOMetric interface
        seoData = platformData?.map(item => ({
          id: item.id,
          metric_name: item.metric_name,
          metric_value: item.metric_value || 0,
          metric_category: 'seo',
          status: 'active',
          details: item.metadata || {},
          updated_at: item.period_start
        })) || [];
      }

      setMetrics(seoData || []);
    } catch (error) {
      console.error('Error loading SEO metrics:', error);
      toast({
        title: "Error loading metrics",
        description: "Could not fetch SEO performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutomationStatus = async () => {
    try {
      const { data } = await supabase
        .from('agent_tasks')
        .select('*')
        .in('action', ['seo_automation', 'sitemap_generation'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const successfulTasks = data.filter(task => task.status === 'completed');
        setAutomation({
          last_run: data[0].updated_at,
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          success_rate: (successfulTasks.length / data.length) * 100,
          total_runs: data.length
        });
      }
    } catch (error) {
      console.error('Error loading automation status:', error);
    }
  };

  const triggerSEOAutomation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seo-automation-engine', {
        body: { automation_type: 'manual_trigger', trigger: 'dashboard' }
      });

      if (error) throw error;

      toast({
        title: "SEO Automation Triggered",
        description: "The SEO automation process has been started",
      });

      setTimeout(loadSEOMetrics, 2000);
    } catch (error) {
      console.error('Error triggering SEO automation:', error);
      toast({
        title: "Automation Failed",
        description: "Could not start SEO automation",
        variant: "destructive",
      });
    }
  };

  const generateSitemap = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-sitemap');
      
      if (error) throw error;

      toast({
        title: "Sitemap Generated",
        description: "XML sitemap has been refreshed successfully",
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Sitemap Generation Failed",
        description: "Could not generate sitemap",
        variant: "destructive",
      });
    }
  };

  const getMetricValue = (name: string) => {
    const metric = metrics.find(m => m.metric_name === name);
    return metric?.metric_value || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading SEO Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage SEO automation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={triggerSEOAutomation} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Trigger Automation
          </Button>
          <Button onClick={generateSitemap} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Sitemap
          </Button>
          <Button onClick={loadSEOMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Pages Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMetricValue('total_seo_pages_generated')}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitemap Entries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMetricValue('sitemap_entries_count')}</div>
            <p className="text-xs text-muted-foreground">
              Updated hourly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMetricValue('cache_hit_rate')}%</div>
            <Progress value={getMetricValue('cache_hit_rate')} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMetricValue('automation_success_rate')}%</div>
            <p className="text-xs text-muted-foreground">
              {automation?.total_runs || 0} total runs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="cache">Content Cache</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Performance Overview</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {metric.metric_name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {metric.details?.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                      <span className="font-mono text-sm">{metric.metric_value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common SEO management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={triggerSEOAutomation} className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Run SEO Automation
                </Button>
                <Button onClick={generateSitemap} variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Regenerate Sitemap
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  SEO Content Audit
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://talentxcel.in/sitemap.xml', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Sitemap
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Status</CardTitle>
              <CardDescription>SEO automation schedule and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {automation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Last Run</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(automation.last_run).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Next Scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(automation.next_run).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Success Rate</p>
                    <Progress value={automation.success_rate} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {automation.success_rate.toFixed(1)}% success rate over {automation.total_runs} runs
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No automation data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Cache Statistics</CardTitle>
              <CardDescription>SEO content caching performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Cache Hit Rate</span>
                  <span className="font-mono">{getMetricValue('cache_hit_rate')}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Freshness Score</span>
                  <span className="font-mono">{getMetricValue('content_freshness_score')}/100</span>
                </div>
                <Progress value={getMetricValue('content_freshness_score')} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Management</CardTitle>
              <CardDescription>XML sitemap generation and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Entries</span>
                  <span className="font-mono">{getMetricValue('sitemap_entries_count')}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={generateSitemap} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://talentxcel.in/sitemap.xml', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View XML
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};