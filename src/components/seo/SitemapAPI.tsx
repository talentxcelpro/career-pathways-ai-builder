
import React, { useEffect, useState } from 'react';
import { generateSitemap, createContentSitemap } from '@/utils/sitemapGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const SitemapAPI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [sitemapStats, setSitemapStats] = useState({
    totalUrls: 0,
    jobs: 0,
    companies: 0,
    courses: 0,
    static: 0
  });

  const generateAllSitemaps = async () => {
    setIsGenerating(true);
    try {
      // Generate main sitemap
      const mainSitemap = await generateSitemap();
      
      // Generate specialized sitemaps
      const jobsSitemap = await createContentSitemap('jobs');
      const companiesSitemap = await createContentSitemap('companies');
      const coursesSitemap = await createContentSitemap('courses');

      // Create downloadable blobs
      const createDownloadLink = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // Trigger downloads
      createDownloadLink(mainSitemap, 'sitemap.xml');
      createDownloadLink(jobsSitemap, 'jobs-sitemap.xml');
      createDownloadLink(companiesSitemap, 'companies-sitemap.xml');
      createDownloadLink(coursesSitemap, 'courses-sitemap.xml');

      // Update stats
      const urlCounts = {
        jobs: (jobsSitemap.match(/<url>/g) || []).length,
        companies: (companiesSitemap.match(/<url>/g) || []).length,
        courses: (coursesSitemap.match(/<url>/g) || []).length,
        static: 15 // Approximate static pages
      };

      setSitemapStats({
        ...urlCounts,
        totalUrls: urlCounts.jobs + urlCounts.companies + urlCounts.courses + urlCounts.static
      });

      setLastGenerated(new Date());
      toast.success('Sitemaps generated and downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating sitemaps:', error);
      toast.error('Failed to generate sitemaps');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitToSearchEngines = () => {
    // Open Google Search Console sitemap submission
    const googleURL = 'https://search.google.com/search-console/sitemaps';
    const bingURL = 'https://www.bing.com/webmasters/home';
    
    window.open(googleURL, '_blank');
    setTimeout(() => {
      window.open(bingURL, '_blank');
    }, 1000);
    
    toast.success('Search engine submission pages opened');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Sitemap Generator
          </CardTitle>
          <CardDescription>
            Generate XML sitemaps for better search engine indexing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sitemapStats.totalUrls}</div>
              <div className="text-sm text-gray-600">Total URLs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sitemapStats.jobs}</div>
              <div className="text-sm text-gray-600">Job Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sitemapStats.companies}</div>
              <div className="text-sm text-gray-600">Company Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{sitemapStats.courses}</div>
              <div className="text-sm text-gray-600">Course Pages</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateAllSitemaps} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generate Sitemaps
            </Button>
            
            <Button 
              variant="outline"
              onClick={submitToSearchEngines}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Submit to Search Engines
            </Button>
          </div>

          {lastGenerated && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Last generated: {lastGenerated.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Checklist</CardTitle>
          <CardDescription>Essential SEO tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>XML Sitemaps</span>
              <Badge variant="default">✓ Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Robots.txt</span>
              <Badge variant="default">✓ Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Meta Tags</span>
              <Badge variant="default">✓ Dynamic</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Structured Data</span>
              <Badge variant="default">✓ Implemented</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Open Graph</span>
              <Badge variant="default">✓ Optimized</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Performance</span>
              <Badge variant="secondary">⚠ Needs Testing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
