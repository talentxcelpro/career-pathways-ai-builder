import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Globe, Search, FileText, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SitemapStats {
  success: boolean;
  submitted_at?: string;
  sitemap_url?: string;
  results?: Array<{
    engine: string;
    success: boolean;
    status?: number;
    error?: string;
  }>;
}

interface SitemapData {
  type: string;
  count: number;
  lastGenerated: string;
  url: string;
  status: 'success' | 'error' | 'pending';
}

export function SEODashboard() {
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);
  const [sitemapData, setSitemapData] = useState<SitemapData[]>([
    { type: 'Jobs', count: 0, lastGenerated: '', url: '/functions/v1/sitemap-generator?type=jobs&page=1', status: 'pending' },
    { type: 'Companies', count: 0, lastGenerated: '', url: '/functions/v1/sitemap-generator?type=companies&page=1', status: 'pending' },
    { type: 'Profiles', count: 0, lastGenerated: '', url: '/functions/v1/sitemap-generator?type=profiles&page=1', status: 'pending' },
    { type: 'Tools', count: 10, lastGenerated: '', url: '/functions/v1/sitemap-generator?type=tools', status: 'pending' },
    { type: 'Static Pages', count: 12, lastGenerated: '', url: '/functions/v1/sitemap-generator?type=static', status: 'pending' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testSitemap = async (type: string, url: string) => {
    try {
      const response = await fetch(`https://dthlgsnakhoftinssokm.supabase.co${url}`);
      if (response.ok) {
        const text = await response.text();
        // Count URLs in the sitemap
        const urlCount = (text.match(/<loc>/g) || []).length;
        
        setSitemapData(prev => prev.map(item => 
          item.type === type 
            ? { ...item, count: urlCount, lastGenerated: new Date().toISOString(), status: 'success' }
            : item
        ));
        
        toast.success(`${type} sitemap loaded successfully (${urlCount} URLs)`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setSitemapData(prev => prev.map(item => 
        item.type === type 
          ? { ...item, status: 'error', lastGenerated: new Date().toISOString() }
          : item
      ));
      toast.error(`Failed to load ${type} sitemap: ${error.message}`);
    }
  };

  const testAllSitemaps = async () => {
    setIsLoading(true);
    
    for (const sitemap of sitemapData) {
      await testSitemap(sitemap.type, sitemap.url);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsLoading(false);
  };

  const submitToSearchEngines = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-generator?type=submit');
      
      if (response.ok) {
        const result = await response.json();
        setSitemapStats(result);
        
        if (result.success) {
          toast.success('Sitemap submitted to search engines successfully!');
        } else {
          toast.error('Failed to submit sitemap to search engines');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast.error(`Failed to submit sitemap: ${error.message}`);
    }
    
    setIsSubmitting(false);
  };

  const generateMainSitemap = async () => {
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-generator?type=index');
      
      if (response.ok) {
        toast.success('Main sitemap index generated successfully!');
        // Open in new tab to view
        window.open('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-generator?type=index', '_blank');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast.error(`Failed to generate main sitemap: ${error.message}`);
    }
  };

  useEffect(() => {
    // Auto-test sitemaps on component mount
    testAllSitemaps();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SEO Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your sitemap generation and search engine submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testAllSitemaps}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button 
            onClick={generateMainSitemap}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Main Sitemap
          </Button>
          <Button 
            onClick={submitToSearchEngines}
            disabled={isSubmitting}
          >
            <Search className={`h-4 w-4 mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
            Submit to Search Engines
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sitemaps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
          <TabsTrigger value="submissions">Search Engine Submissions</TabsTrigger>
          <TabsTrigger value="analytics">SEO Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sitemaps" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sitemapData.map((sitemap) => (
              <Card key={sitemap.type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {sitemap.type}
                  </CardTitle>
                  {getStatusIcon(sitemap.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{sitemap.count.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">URLs indexed</p>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(sitemap.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testSitemap(sitemap.type, sitemap.url)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                    {sitemap.lastGenerated && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(sitemap.lastGenerated).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Direct links to sitemap endpoints and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://talentxcel.in/sitemap.xml', '_blank')}
                  className="justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Live Sitemap
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://talentxcel.in/robots.txt', '_blank')}
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Robots.txt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://search.google.com/search-console', '_blank')}
                  className="justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Google Search Console
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.bing.com/webmasters', '_blank')}
                  className="justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Bing Webmaster Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Submission Status</CardTitle>
              <CardDescription>
                Track sitemap submissions to Google and Bing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sitemapStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Submission Status:</span>
                    <Badge variant={sitemapStats.success ? "default" : "destructive"}>
                      {sitemapStats.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  {sitemapStats.submitted_at && (
                    <div className="flex items-center justify-between">
                      <span>Submitted At:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(sitemapStats.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {sitemapStats.results && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Submission Results:</h4>
                      {sitemapStats.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{result.engine}</span>
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {result.status && `HTTP ${result.status}`}
                              {result.error && result.error}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet. Click "Submit to Search Engines" to test the submission process.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SEO Status</CardTitle>
                <CardDescription>Overall SEO health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Sitemap Index</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Robots.txt</span>
                    <Badge variant="default">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-submission</span>
                    <Badge variant="default">Daily @ 2 AM UTC</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total URLs</span>
                    <span className="font-mono">{sitemapData.reduce((sum, s) => sum + s.count, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Breakdown of indexable content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sitemapData.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <span className="text-sm font-mono">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}