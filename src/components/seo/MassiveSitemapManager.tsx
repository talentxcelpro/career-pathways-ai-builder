import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, Zap, Globe, Share2, Brain, BarChart3, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SitemapStats {
  total_urls: number;
  generation_time_ms: number;
  sitemap_type: string;
  generated_at: string;
}

export const MassiveSitemapManager: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [activeTab, setActiveTab] = useState('full');

  const generateMassiveSitemap = async (sitemapType: string, limit = 50000) => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 100);

      const { data, error } = await supabase.functions.invoke('massive-sitemap-generator', {
        body: { sitemapType, limit }
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (error) throw error;
      
      setStats(data.stats);
      
      // Create downloadable sitemap
      const blob = new Blob([data.sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `massive-sitemap-${sitemapType}-${Date.now()}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Generated ${data.stats.total_urls.toLocaleString()} URLs in ${data.stats.generation_time_ms}ms!`);
      
    } catch (error) {
      console.error('Error generating massive sitemap:', error);
      toast.error('Failed to generate massive sitemap');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType: 'landing_page',
          topic: 'Career Growth Opportunities',
          generateBulk: true,
          bulkCount: 50
        }
      });
      
      if (error) throw error;
      toast.success('AI content generation started!');
      
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to start AI content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSocialContent = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('social-content-generator', {
        body: {
          contentType: 'post',
          platform: 'linkedin',
          topic: 'Career Development Tips',
          generateBatch: true,
          batchSize: 30
        }
      });
      
      if (error) throw error;
      toast.success('Social content generation started!');
      
    } catch (error) {
      console.error('Error generating social content:', error);
      toast.error('Failed to start social content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const sitemapTypes = [
    {
      id: 'full',
      title: 'Complete Massive Sitemap',
      description: 'All content types combined - millions of pages',
      icon: Globe,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      limit: 100000
    },
    {
      id: 'seo',
      title: 'SEO Landing Pages',
      description: 'Programmatic SEO content combinations',
      icon: Zap,
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
      limit: 25000
    },
    {
      id: 'dynamic',
      title: 'Dynamic Content Pages',
      description: 'Jobs, companies, courses by location/role/skill',
      icon: RefreshCw,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      limit: 50000
    },
    {
      id: 'social',
      title: 'Social Media Pages',
      description: 'Social media integrated content',
      icon: Share2,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600',
      limit: 10000
    },
    {
      id: 'ai',
      title: 'AI-Generated Content',
      description: 'AI-powered landing pages and articles',
      icon: Brain,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      limit: 15000
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Massive Sitemap Generation System
          </CardTitle>
          <p className="text-muted-foreground">
            Generate millions of SEO-optimized pages with AI-powered content and social media integration
          </p>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generating sitemap...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.total_urls.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total URLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.generation_time_ms}ms
                </div>
                <div className="text-xs text-muted-foreground">Generation Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.sitemap_type}
                </div>
                <div className="text-xs text-muted-foreground">Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(stats.generated_at).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">Generated At</div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate Sitemaps</TabsTrigger>
              <TabsTrigger value="content">AI Content</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sitemapTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <Badge variant="secondary" className="w-fit">
                          Up to {type.limit.toLocaleString()} pages
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => generateMassiveSitemap(type.id, type.limit)}
                          disabled={isGenerating}
                          className="w-full"
                          size="sm"
                        >
                          {isGenerating && activeTab === 'generate' ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Generate & Download
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Content Generation
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generate thousands of AI-powered landing pages and articles
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating AI Content...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate 50 AI Pages
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Creates job descriptions, company pages, blog posts, and landing pages
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Job Descriptions', 'Company Pages', 'Blog Posts', 'Landing Pages', 'Course Descriptions'].map((type, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{type}</span>
                          <Badge variant="outline">AI-Powered</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Social Media Content
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generate social media content for multiple platforms
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={generateSocialContent}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Social Content...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Generate 30 Social Posts
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Creates content for LinkedIn, Twitter, Facebook, Instagram, and TikTok
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'TikTok'].map((platform, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{platform}</span>
                          <Badge variant="outline">Optimized</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Advanced Features
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Programmatic SEO with infinite content combinations</li>
              <li>• AI-powered content generation with OpenAI</li>
              <li>• Social media platform optimization</li>
              <li>• Performance tracking and analytics</li>
              <li>• Automatic sitemap submission to search engines</li>
              <li>• Real-time generation progress tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};