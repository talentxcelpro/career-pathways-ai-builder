import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

export const SEOCronManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPages: 0,
    generatedPages: 0,
    pendingPages: 0,
  });
  const { toast } = useToast();

  const runSEOGeneration = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-auto-generator');
      
      if (error) throw error;

      toast({
        title: "SEO Generation Complete",
        description: `Generated ${data.generated} new pages, skipped ${data.skipped} existing pages.`,
      });

      setLastRun(new Date().toISOString());
      await fetchStats();
    } catch (error) {
      console.error('Error running SEO generation:', error);
      toast({
        title: "Error",
        description: "Failed to run SEO generation. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [totalRes, generatedRes] = await Promise.all([
        supabase.from('seo_page_combinations').select('id', { count: 'exact' }),
        supabase.from('seo_generated_content').select('id', { count: 'exact' })
      ]);

      setStats({
        totalPages: totalRes.count || 0,
        generatedPages: generatedRes.count || 0,
        pendingPages: (totalRes.count || 0) - (generatedRes.count || 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const generateSitemap = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sitemap-xml');
      
      if (error) throw error;

      // Open sitemap in new tab
      window.open('https://dthlgsnakhoftinssokm.functions.supabase.co/sitemap-xml', '_blank');
      
      toast({
        title: "Sitemap Generated",
        description: "Sitemap.xml has been generated and is now live.",
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SEO Pages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Page combinations configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Content</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.generatedPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated pages ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Generation</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Pages waiting for content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEO Generation Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SEO Content Generation
          </CardTitle>
          <CardDescription>
            Automatically generate AI-powered content for all SEO pages. This process runs in batches of 50 pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Running" : "Ready"}
              </Badge>
              {lastRun && (
                <span className="text-sm text-muted-foreground">
                  Last run: {new Date(lastRun).toLocaleString()}
                </span>
              )}
            </div>
            <Button 
              onClick={runSEOGeneration} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? "Generating..." : "Run Generation"}
            </Button>
          </div>

          <div className="p-4 bg-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>What this does:</strong> Generates SEO-optimized content for pages that don't have content yet. 
              Includes meta titles, descriptions, H1 tags, intro content, FAQs, and structured data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sitemap Management */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Management</CardTitle>
          <CardDescription>
            Generate and manage XML sitemaps for search engine discovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Live Sitemap</p>
              <p className="text-sm text-muted-foreground">
                Auto-updated from database: /sitemap.xml
              </p>
            </div>
            <Button variant="outline" onClick={generateSitemap}>
              View Sitemap
            </Button>
          </div>

          <div className="p-4 bg-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Setup Instructions:</strong>
            </p>
            <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
              <li>Submit sitemap to Google Search Console: <code>https://talentxcel.in/sitemap.xml</code></li>
              <li>Submit to Bing Webmaster Tools for additional coverage</li>
              <li>Sitemap auto-updates as new pages are added to the database</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};