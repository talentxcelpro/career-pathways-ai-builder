import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Target,
  Rocket
} from "lucide-react";

interface SEOStats {
  totalPages: number;
  byPageType: Record<string, { count: number; avgQuality: number }>;
  averageQuality: number;
  recentlyUpdated: number;
}

interface SEOStatus {
  totalPages: number;
  recentActivity: any[];
  topPerformers: any[];
}

export const AutomatedSEODashboard = () => {
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [status, setStatus] = useState<SEOStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState('1000');
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [performanceRes, statusRes] = await Promise.all([
        supabase.functions.invoke('seo-automation-engine', {
          body: { action: 'performance' }
        }),
        supabase.functions.invoke('seo-automation-engine', {
          body: { action: 'status' }
        })
      ]);

      if (performanceRes.data?.success) {
        setStats(performanceRes.data.performance);
      }

      if (statusRes.data?.success) {
        setStatus(statusRes.data.status);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const generateMassiveSEOPages = async () => {
    setIsGenerating(true);
    setGenerationLog([]);
    
    try {
      // Generate millions of SEO pages across different categories
      const pageTypes = ['job', 'location', 'skill', 'company', 'industry', 'salary'];
      const locations = [
        'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata',
        'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'
      ];
      const skills = [
        'javascript', 'python', 'react', 'node-js', 'aws', 'azure', 'docker',
        'kubernetes', 'machine-learning', 'data-science', 'devops', 'cloud-computing'
      ];
      const roles = [
        'software-engineer', 'data-scientist', 'product-manager', 'devops-engineer',
        'ui-ux-designer', 'business-analyst', 'project-manager', 'quality-engineer'
      ];
      const companies = [
        'google', 'microsoft', 'amazon', 'apple', 'facebook', 'netflix', 'uber',
        'airbnb', 'spotify', 'salesforce', 'oracle', 'adobe', 'intel', 'nvidia'
      ];

      const allRequests = [];

      // Job + Location combinations (8 roles × 14 locations = 112 pages)
      roles.forEach(role => {
        locations.forEach(location => {
          allRequests.push({
            pageType: 'job',
            primarySlug: role,
            secondarySlug: location,
            priority: 'high'
          });
        });
      });

      // Skill + Location combinations (12 skills × 14 locations = 168 pages)
      skills.forEach(skill => {
        locations.forEach(location => {
          allRequests.push({
            pageType: 'skill',
            primarySlug: skill,
            secondarySlug: location,
            priority: 'medium'
          });
        });
      });

      // Company + Role + Location combinations (14 companies × 8 roles × 14 locations = 1,568 pages)
      companies.forEach(company => {
        roles.forEach(role => {
          locations.slice(0, 5).forEach(location => { // Limit to top 5 locations
            allRequests.push({
              pageType: 'company',
              primarySlug: company,
              secondarySlug: role,
              tertiarySlug: location,
              priority: 'medium'
            });
          });
        });
      });

      // Single-dimension pages
      [...roles, ...skills, ...locations, ...companies].forEach(item => {
        allRequests.push({
          pageType: 'job',
          primarySlug: item,
          priority: 'medium'
        });
      });

      addToLog(`Starting generation of ${allRequests.length} SEO pages...`);

      // Process in batches
      const batch = parseInt(batchSize);
      let totalGenerated = 0;

      for (let i = 0; i < allRequests.length; i += batch) {
        const currentBatch = allRequests.slice(i, i + batch);
        addToLog(`Processing batch ${Math.floor(i / batch) + 1}/${Math.ceil(allRequests.length / batch)} (${currentBatch.length} pages)...`);

        const response = await supabase.functions.invoke('seo-automation-engine', {
          body: {
            action: 'bulk-generate',
            requests: currentBatch,
            batchSize: batch
          }
        });

        if (response.data?.success) {
          totalGenerated += response.data.totalGenerated;
          addToLog(`✅ Batch completed: ${response.data.totalGenerated}/${response.data.totalRequested} pages generated`);
        } else {
          addToLog(`❌ Batch failed: ${response.error?.message || 'Unknown error'}`);
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      addToLog(`🎉 Generation complete! Total pages created: ${totalGenerated}`);
      
      toast({
        title: "Success!",
        description: `Generated ${totalGenerated} SEO pages successfully`,
      });

      // Reload dashboard data
      await loadDashboardData();

    } catch (error) {
      console.error('Error generating SEO pages:', error);
      addToLog(`❌ Generation failed: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to generate SEO pages",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGenerationLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const downloadSitemap = async (type: string = 'all') => {
    try {
      const response = await supabase.functions.invoke('seo-automation-engine', {
        body: { action: 'sitemap', type }
      });

      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sitemap-${type}-${Date.now()}.xml`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to download sitemap",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Automated SEO Engine</h1>
        <p className="text-muted-foreground">Generate millions of SEO-optimized pages automatically</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SEO Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPages?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentlyUpdated || 0} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats?.averageQuality || 0)}%</div>
            <Progress value={stats?.averageQuality || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats?.byPageType || {}).length}</div>
            <p className="text-xs text-muted-foreground">Different categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">System operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Pages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Mass SEO Page Generation
              </CardTitle>
              <CardDescription>
                Generate millions of SEO-optimized pages across all categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Batch Size</label>
                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    placeholder="1000"
                    min="100"
                    max="5000"
                  />
                </div>
                <Button 
                  onClick={generateMassiveSEOPages}
                  disabled={isGenerating}
                  size="lg"
                  className="mt-6"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Million+ Pages
                    </>
                  )}
                </Button>
              </div>

              {generationLog.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Generation Log</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {generationLog.map((log, index) => (
                      <div key={index} className="text-sm font-mono">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pages by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats?.byPageType || {}).map(([type, data]) => (
                    <div key={type} className="flex justify-between items-center">
                      <Badge variant="outline">{type}</Badge>
                      <span className="font-medium">{data.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {status?.topPerformers?.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate">{page.primary_slug}</span>
                      <Badge variant="secondary">{page.quality_score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sitemaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Sitemap Generation</CardTitle>
              <CardDescription>
                Generate and download sitemaps for millions of SEO pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['all', 'job', 'location', 'skill', 'company'].map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => downloadSitemap(type)}
                    className="w-full"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Sitemap
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{activity.primary_slug}</div>
                      <div className="text-sm text-muted-foreground">{activity.page_type}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{activity.quality_score}%</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.last_generated_at).toLocaleDateString()}
                      </div>
                    </div>
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