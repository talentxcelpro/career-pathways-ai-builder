import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { SitemapAPI } from './SitemapAPI';
import { generateEnhancedSitemap, generateNewsSitemap } from '@/utils/enhancedSitemapGenerator';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Download,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const SEODashboard = () => {
  const [sitemapUrls, setSitemapUrls] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoScore, setSeoScore] = useState(85);

  const handleGenerateEnhancedSitemap = async () => {
    setIsGenerating(true);
    try {
      const sitemap = await generateEnhancedSitemap();
      const newsSitemap = await generateNewsSitemap();
      
      // Create downloadable files
      const createDownload = (content: string, filename: string) => {
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

      createDownload(sitemap, 'enhanced-sitemap.xml');
      createDownload(newsSitemap, 'news-sitemap.xml');
      
      toast.success('Enhanced sitemaps generated and downloaded!');
    } catch (error) {
      toast.error('Failed to generate enhanced sitemaps');
    } finally {
      setIsGenerating(false);
    }
  };

  const seoMetrics = [
    { label: 'Indexed Pages', value: '12,500+', change: '+15%', status: 'good' },
    { label: 'Organic Traffic', value: '45K/month', change: '+23%', status: 'good' },
    { label: 'Average Position', value: '4.2', change: '-0.8', status: 'warning' },
    { label: 'Click-through Rate', value: '12.5%', change: '+2.1%', status: 'good' },
  ];

  const landingPageStats = [
    { type: 'Jobs by Location', count: 8, performance: 92 },
    { type: 'Jobs by Role', count: 6, performance: 88 },
    { type: 'Jobs by Skill', count: 6, performance: 85 },
    { type: 'Courses by Category', count: 6, performance: 90 },
    { type: 'Companies by Location', count: 8, performance: 83 },
    { type: 'Salary Guides', count: 4, performance: 87 },
  ];

  const seoChecklist = [
    { item: 'Dynamic Meta Tags', status: 'completed', description: 'Title, description, and OG tags' },
    { item: 'Structured Data', status: 'completed', description: 'JSON-LD schema markup' },
    { item: 'XML Sitemaps', status: 'completed', description: 'Enhanced with images and alternates' },
    { item: 'Robots.txt', status: 'completed', description: 'Optimized crawling instructions' },
    { item: 'Canonical URLs', status: 'completed', description: 'Prevent duplicate content' },
    { item: 'Mobile Optimization', status: 'completed', description: 'Responsive design' },
    { item: 'Page Speed', status: 'warning', description: 'Needs optimization' },
    { item: 'Core Web Vitals', status: 'warning', description: 'Monitor and improve' },
  ];

  const phase4Features = [
    { name: 'Performance Optimization', status: 'active', description: 'Lazy loading & Core Web Vitals' },
    { name: 'RSS Feed Generation', status: 'active', description: 'Content syndication feeds' },
    { name: 'Advanced Structured Data', status: 'active', description: 'Enhanced JSON-LD markup' },
    { name: 'Multi-language Support', status: 'active', description: 'Hreflang implementation' },
    { name: 'Advanced Robots.txt', status: 'active', description: 'Enhanced crawling rules' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Performance Overview
          </CardTitle>
          <CardDescription>
            Overall SEO health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">SEO Score</span>
                <span className="text-sm text-gray-600">{seoScore}/100</span>
              </div>
              <Progress value={seoScore} className="h-3" />
            </div>
            <Badge variant={seoScore >= 80 ? "default" : "secondary"} className="text-lg px-4 py-2">
              {seoScore >= 90 ? 'Excellent' : seoScore >= 80 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seoMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {metric.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 4 Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Phase 4 - Advanced Features
          </CardTitle>
          <CardDescription>
            Performance optimization and advanced SEO features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phase4Features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{feature.name}</span>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="landing-pages" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="landing-pages">Landing Pages</TabsTrigger>
          <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
          <TabsTrigger value="checklist">SEO Checklist</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="landing-pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Landing Pages Performance</CardTitle>
              <CardDescription>
                Performance metrics for category-based landing pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {landingPageStats.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{page.type}</h3>
                      <p className="text-sm text-gray-600">{page.count} pages created</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{page.performance}% Score</div>
                        <Progress value={page.performance} className="w-20 h-2" />
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemaps" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Standard Sitemaps
                </CardTitle>
                <CardDescription>Basic XML sitemaps for search engines</CardDescription>
              </CardHeader>
              <CardContent>
                <SitemapAPI />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Enhanced Sitemaps
                </CardTitle>
                <CardDescription>Advanced sitemaps with images and alternates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Enhanced XML Sitemap</span>
                    <Badge variant="default">Images + Alternates</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>News Sitemap</span>
                    <Badge variant="secondary">Blog Posts</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mobile Sitemap</span>
                    <Badge variant="outline">Mobile-First</Badge>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateEnhancedSitemap}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Enhanced Sitemaps
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                SEO Implementation Checklist
              </CardTitle>
              <CardDescription>
                Track SEO best practices implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoChecklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{item.item}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {item.status === 'completed' ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Analysis Tools</CardTitle>
                <CardDescription>External tools for SEO monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                    <Search className="h-4 w-4 mr-2" />
                    Google Search Console
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    PageSpeed Insights
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Bing Webmaster Tools
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common SEO maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Update Robots.txt
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Test Structured Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Core Web Vitals
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;
