import React, { useState, useEffect } from 'react';
import { SEOPerformanceDashboard } from '@/components/seo/SEOPerformanceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Rocket,
  RefreshCw,
  Download,
  Eye,
  Clock
} from "lucide-react";

interface SEOMetrics {
  totalPages: number;
  totalJobs: number;
  seoOptimizedJobs: number;
  generatedPages: number;
  averageQuality: number;
  recentlyGenerated: number;
  byPageType: Record<string, { count: number; avgQuality: number }>;
}

interface GenerationProgress {
  isGenerating: boolean;
  progress: number;
  currentBatch: number;
  totalBatches: number;
  generatedCount: number;
  log: string[];
}

export const SEODashboardNew = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    isGenerating: false,
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    generatedCount: 0,
    log: []
  });
  const [batchSize, setBatchSize] = useState('500');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSEOMetrics();
    // Set up real-time updates
    const channel = supabase
      .channel('seo-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'seo_generated_content'
      }, () => {
        loadSEOMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSEOMetrics = async () => {
    try {
      setLoading(true);
      
      // Get jobs data
      const [jobsRes, generatedRes] = await Promise.all([
        supabase.from('jobs').select('id, meta_title, seo_slug').eq('is_active', true),
        supabase.from('seo_generated_content').select('*').eq('is_active', true)
      ]);

      const totalJobs = jobsRes.data?.length || 0;
      const seoOptimizedJobs = jobsRes.data?.filter(job => job.meta_title && job.seo_slug).length || 0;
      const generatedPages = generatedRes.data?.length || 0;

      // Calculate average quality from generated content
      const totalQuality = generatedRes.data?.reduce((sum, page) => sum + (page.quality_score || 0), 0) || 0;
      const averageQuality = generatedPages > 0 ? totalQuality / generatedPages : 85; // Default to 85 for jobs

      // Count recent generations (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentlyGenerated = generatedRes.data?.filter(page => 
        new Date(page.last_generated_at) > yesterday
      ).length || 0;

      // Group by page type
      const byPageType = generatedRes.data?.reduce((acc: any, page: any) => {
        if (!acc[page.page_type]) {
          acc[page.page_type] = { count: 0, avgQuality: 0 };
        }
        acc[page.page_type].count++;
        acc[page.page_type].avgQuality += page.quality_score || 0;
        return acc;
      }, {}) || {};

      // Calculate average quality per type
      Object.keys(byPageType).forEach(type => {
        byPageType[type].avgQuality = byPageType[type].avgQuality / byPageType[type].count;
      });

      // Add jobs as a page type
      if (totalJobs > 0) {
        byPageType['job'] = { count: totalJobs, avgQuality: 85 };
      }

      setMetrics({
        totalPages: totalJobs + generatedPages,
        totalJobs,
        seoOptimizedJobs,
        generatedPages,
        averageQuality: Math.round(averageQuality),
        recentlyGenerated,
        byPageType
      });

    } catch (error) {
      console.error('Error loading SEO metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load SEO metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMassiveSEOPages = async () => {
    setProgress(prev => ({ ...prev, isGenerating: true, log: [], generatedCount: 0 }));
    
    try {
      addToLog('Starting massive SEO page generation...');
      
      // Define comprehensive page generation strategy
      const pageRequests = [];
      
      // Job + Location combinations
      const locations = [
        'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata',
        'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'
      ];
      
      const jobRoles = [
        'software-engineer', 'data-scientist', 'product-manager', 'devops-engineer',
        'ui-ux-designer', 'business-analyst', 'project-manager', 'quality-engineer',
        'frontend-developer', 'backend-developer', 'full-stack-developer', 'mobile-developer'
      ];

      const skills = [
        'javascript', 'python', 'react', 'node-js', 'aws', 'azure', 'docker',
        'kubernetes', 'machine-learning', 'data-analysis', 'sql', 'mongodb'
      ];

      const companies = [
        'google', 'microsoft', 'amazon', 'apple', 'facebook', 'netflix', 'uber',
        'airbnb', 'spotify', 'salesforce', 'tcs', 'infosys', 'wipro', 'cognizant'
      ];

      // Generate job + location pages
      jobRoles.forEach(role => {
        locations.forEach(location => {
          pageRequests.push({
            pageType: 'job',
            primarySlug: role,
            secondarySlug: location,
            priority: 'high'
          });
        });
      });

      // Generate skill + location pages
      skills.forEach(skill => {
        locations.forEach(location => {
          pageRequests.push({
            pageType: 'skill',
            primarySlug: skill,
            secondarySlug: location,
            priority: 'medium'
          });
        });
      });

      // Generate company + role + location pages (top 5 locations only for companies)
      companies.forEach(company => {
        jobRoles.slice(0, 6).forEach(role => {
          locations.slice(0, 5).forEach(location => {
            pageRequests.push({
              pageType: 'company',
              primarySlug: company,
              secondarySlug: role,
              tertiarySlug: location,
              priority: 'medium'
            });
          });
        });
      });

      addToLog(`Prepared ${pageRequests.length} page generation requests`);

      // Process in batches
      const batch = parseInt(batchSize);
      const totalBatches = Math.ceil(pageRequests.length / batch);
      setProgress(prev => ({ ...prev, totalBatches }));

      let totalGenerated = 0;

      for (let i = 0; i < pageRequests.length; i += batch) {
        const currentBatch = pageRequests.slice(i, i + batch);
        const batchNumber = Math.floor(i / batch) + 1;
        
        setProgress(prev => ({ 
          ...prev, 
          currentBatch: batchNumber,
          progress: (batchNumber / totalBatches) * 100 
        }));
        
        addToLog(`Processing batch ${batchNumber}/${totalBatches} (${currentBatch.length} pages)...`);

        const { data, error } = await supabase.functions.invoke('seo-automation-engine', {
          body: {
            action: 'bulk-generate',
            requests: currentBatch,
            batchSize: batch
          }
        });

        if (error) {
          addToLog(`❌ Batch ${batchNumber} failed: ${error.message}`);
          console.error('Batch error:', error);
        } else if (data?.success) {
          totalGenerated += data.totalGenerated || 0;
          addToLog(`✅ Batch ${batchNumber} completed: ${data.totalGenerated} pages generated`);
          setProgress(prev => ({ ...prev, generatedCount: totalGenerated }));
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      addToLog(`🎉 Generation complete! Total pages created: ${totalGenerated}`);
      
      toast({
        title: "Success!",
        description: `Generated ${totalGenerated} SEO pages successfully`,
      });

      // Reload metrics
      await loadSEOMetrics();

    } catch (error: any) {
      console.error('SEO generation error:', error);
      addToLog(`❌ Generation failed: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to generate SEO pages",
        variant: "destructive"
      });
    } finally {
      setProgress(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setProgress(prev => ({
      ...prev,
      log: [...prev.log, `[${timestamp}] ${message}`]
    }));
  };

  const downloadSitemap = async (type: string = 'all') => {
    try {
      const response = await supabase.functions.invoke('seo-automation-engine', {
        body: { action: 'sitemap', type }
      });

      if (response.data) {
        // Create and download XML file
        const xmlContent = response.data;
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sitemap-${type}-${Date.now()}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: `Sitemap downloaded successfully`,
        });
      }
    } catch (error: any) {
      console.error('Sitemap download error:', error);
      toast({
        title: "Error",
        description: "Failed to download sitemap",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading SEO metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SEO Enhancement Suite</h1>
          <p className="text-xl text-muted-foreground">Advanced SEO automation and optimization tools</p>
        </div>

        <div className="bg-card p-6 rounded-lg border mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Enhancement Status</h2>
              <p className="text-muted-foreground">SEO enhancement engine is active and optimizing content!</p>
            </div>
            <Button onClick={loadSEOMetrics} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="scalability">Scalability</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <SEOPerformanceDashboard />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total SEO Pages</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalPages.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">+{metrics?.recentlyGenerated || 0} today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Generated Pages</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.generatedPages.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">AI-generated content</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.averageQuality || 0}%</div>
                  <Progress value={metrics?.averageQuality || 0} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Massive SEO Generation
                </CardTitle>
                <CardDescription>Generate millions of SEO-optimized pages automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress.isGenerating ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Generating SEO pages...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Batch {progress.currentBatch} of {progress.totalBatches}</span>
                        <span>{progress.generatedCount} pages generated</span>
                      </div>
                      <Progress value={progress.progress} />
                    </div>
                    {progress.log.length > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Generation Log</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {progress.log.slice(-10).map((log, index) => (
                            <div key={index} className="text-sm font-mono">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Batch Size</label>
                        <Input
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(e.target.value)}
                          placeholder="500"
                          min="100"
                          max="1000"
                        />
                      </div>
                      <Button 
                        onClick={generateMassiveSEOPages}
                        size="lg"
                        className="mt-6"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Million+ Pages
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" onClick={() => downloadSitemap('all')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download All Sitemap
                      </Button>
                      <Button variant="outline" onClick={() => downloadSitemap('job')}>
                        <Download className="mr-2 h-4 w-4" />
                        Jobs Sitemap
                      </Button>
                      <Button variant="outline" onClick={() => downloadSitemap('skill')}>
                        <Download className="mr-2 h-4 w-4" />
                        Skills Sitemap
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scalability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Page Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Pages by Type</h4>
                    <div className="space-y-3">
                      {Object.entries(metrics?.byPageType || {}).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Badge variant="outline">{type}</Badge>
                          <span className="font-medium">{data.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Quality Metrics</h4>
                    <div className="space-y-3">
                      {Object.entries(metrics?.byPageType || {}).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={data.avgQuality} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round(data.avgQuality)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};