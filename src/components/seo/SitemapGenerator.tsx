import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SitemapGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapUrl, setSitemapUrl] = useState<string | null>(null);

  const generateSitemap = async () => {
    setIsGenerating(true);
    try {
      // Call the sitemap generation edge function
      const { data, error } = await supabase.functions.invoke('enhanced-sitemap');
      
      if (error) throw error;
      
      // Create a blob with the sitemap XML
      const blob = new Blob([data.sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      setSitemapUrl(url);
      
      toast.success(`Sitemap generated successfully! ${data.stats.total_urls} URLs included.`);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast.error('Failed to generate sitemap');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNetworkSitemap = async () => {
    setIsGenerating(true);
    try {
      // Generate network sitemap index
      const { data, error } = await supabase.functions.invoke('network-sitemap', {
        body: { type: 'index' }
      });
      
      if (error) throw error;
      
      // Create a blob with the network sitemap XML
      const blob = new Blob([data], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      setSitemapUrl(url);
      
      toast.success('Network sitemap index generated successfully!');
    } catch (error) {
      console.error('Error generating network sitemap:', error);
      toast.error('Failed to generate network sitemap');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSitemap = () => {
    if (sitemapUrl) {
      const link = document.createElement('a');
      link.href = sitemapUrl;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateRobotsTxt = () => {
    const robotsContent = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://talentxcel.in/sitemap.xml
Sitemap: https://talentxcel.in/sitemap-jobs.xml
Sitemap: https://talentxcel.in/sitemap-network.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/

# Allow job pages
Allow: /jobs/
Allow: /companies/
Allow: /career-guidance/
Allow: /tools/

# Crawl delay for polite crawling
Crawl-delay: 1
`;

    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('robots.txt file downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          SEO Sitemap Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Button 
            onClick={generateSitemap} 
            disabled={isGenerating}
            className="w-fit"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Sitemap...
              </>
            ) : (
              'Generate XML Sitemap'
            )}
          </Button>
          
          <Button 
            onClick={generateNetworkSitemap} 
            disabled={isGenerating}
            variant="outline"
            className="w-fit"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Network Sitemap...
              </>
            ) : (
              'Generate Network Sitemap Index'
            )}
          </Button>
          
          {sitemapUrl && (
            <Button 
              onClick={downloadSitemap}
              variant="outline"
              className="w-fit"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sitemap
            </Button>
          )}
          
          <Button 
            onClick={generateRobotsTxt}
            variant="outline"
            className="w-fit"
          >
            <Download className="w-4 h-4 mr-2" />
            Download robots.txt
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">SEO Recommendations:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Submit sitemap to Google Search Console</li>
            <li>• Upload robots.txt to your domain root</li>
            <li>• Update sitemap weekly for fresh content</li>
            <li>• Monitor indexing status in search console</li>
            <li>• Test job pages with Google's Rich Results Test</li>
          </ul>
        </div>

        <div className="mt-4 space-y-2">
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => window.open('https://search.google.com/search-console', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Google Search Console
          </Button>
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Google Rich Results Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};