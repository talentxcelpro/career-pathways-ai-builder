import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Link, 
  FileText, 
  Target, 
  Eye, 
  Zap,
  Brain,
  Globe,
  CheckCircle,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  Settings,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOKeywordResearch } from '@/components/seo/SEOKeywordResearch';
import { SEOSiteAudit } from '@/components/seo/SEOSiteAudit';
import { SEOContentOptimizer } from '@/components/seo/SEOContentOptimizer';
import { SEORankTracker } from '@/components/seo/SEORankTracker';
import { SEOBacklinkAnalyzer } from '@/components/seo/SEOBacklinkAnalyzer';
import { SEOCompetitorAnalysis } from '@/components/seo/SEOCompetitorAnalysis';
import { SEOReporting } from '@/components/seo/SEOReporting';

import { RealTimeSEOAnalyzer } from '@/components/seo/advanced/RealTimeSEOAnalyzer';
import { PredictiveSEOInsights } from '@/components/seo/advanced/PredictiveSEOInsights';
import { SEOAutomationWorkflows } from '@/components/seo/advanced/SEOAutomationWorkflows';
import { AdvancedCompetitorIntelligence } from '@/components/seo/enhanced/AdvancedCompetitorIntelligence';
import { LocalSEOTracker } from '@/components/seo/enhanced/LocalSEOTracker';
import { AIContentGenerator } from '@/components/seo/phase3/AIContentGenerator';
import { MLRankPredictor } from '@/components/seo/phase3/MLRankPredictor';
import { SEOAutomationEngine } from '@/components/seo/phase3/SEOAutomationEngine';
import { WhiteLabelReports } from '@/components/seo/phase3/WhiteLabelReports';
import { toast } from 'sonner';

const SEOSuite = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [seoScore, setSeoScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [seoMetrics, setSeoMetrics] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalPosts: 0,
    totalProfiles: 0
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchSEOMetrics = async () => {
      try {
        const [jobsResult, companiesResult, postsResult, profilesResult] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact', head: true }),
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true })
        ]);

        setSeoMetrics({
          totalJobs: jobsResult.count || 0,
          totalCompanies: companiesResult.count || 0,
          totalPosts: postsResult.count || 0,
          totalProfiles: profilesResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching SEO metrics:', error);
      }
    };

    fetchSEOMetrics();
  }, []);

  const handleQuickAnalysis = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('url-metadata', {
        body: { url: websiteUrl }
      });

      if (error) throw error;

      // Calculate SEO score based on metadata
      let score = 30; // Base score
      if (data.title && data.title.length > 0) score += 20;
      if (data.description && data.description.length > 0) score += 20;
      if (data.image_url) score += 15;
      if (data.title && data.title.length <= 60) score += 10;
      if (data.description && data.description.length <= 160) score += 5;

      setSeoScore(Math.min(score, 100));
      setAnalysisResult(data);
      toast.success('SEO analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze website. Please check the URL and try again.');
      setSeoScore(0);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const platformMetrics = [
    { 
      label: 'Total Jobs', 
      value: seoMetrics.totalJobs.toLocaleString(), 
      change: 'Active', 
      positive: true,
      icon: FileText
    },
    { 
      label: 'Companies', 
      value: seoMetrics.totalCompanies.toLocaleString(), 
      change: 'Verified', 
      positive: true,
      icon: Users
    },
    { 
      label: 'Content Posts', 
      value: seoMetrics.totalPosts.toLocaleString(), 
      change: 'Published', 
      positive: true,
      icon: BarChart3
    },
    { 
      label: 'User Profiles', 
      value: seoMetrics.totalProfiles.toLocaleString(), 
      change: 'Indexed', 
      positive: true,
      icon: Target
    },
  ];

  const quickActions = [
    { icon: Search, label: 'Keyword Research', desc: 'Find high-value keywords', tab: 'keywords' },
    { icon: FileText, label: 'Site Audit', desc: 'Analyze technical SEO', tab: 'audit' },
    { icon: TrendingUp, label: 'Rank Tracking', desc: 'Monitor keyword positions', tab: 'tracking' },
    { icon: Link, label: 'Backlink Analysis', desc: 'Analyze link profile', tab: 'backlinks' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Helmet>
        <title>TalentXcel SEO Suite - AI-Powered SEO Platform</title>
        <meta name="description" content="Complete AI-powered SEO platform with keyword research, site audits, rank tracking, and competitor analysis" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            TalentXcel SEO Suite
          </h1>
          <p className="text-muted-foreground mt-2">AI-powered SEO platform that outperforms industry leaders</p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <Zap className="h-3 w-3 mr-1" />
          AI-Enhanced
        </Badge>
      </div>

      {/* Quick Analysis Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Quick SEO Analysis
          </CardTitle>
          <CardDescription>Get instant AI-powered SEO insights for any website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter website URL (e.g., https://example.com)"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleQuickAnalysis}
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          {seoScore > 0 && analysisResult && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">SEO Health Score</span>
                  <span className="text-2xl font-bold text-primary">{seoScore}/100</span>
                </div>
                <Progress value={seoScore} className="h-2" />
                <div className="mt-2 text-sm text-muted-foreground">
                  {seoScore >= 80 ? 'Excellent SEO performance' : 
                   seoScore >= 60 ? 'Good with room for improvement' : 
                   'Needs significant optimization'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Page Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Title Tag</span>
                      <Badge variant={analysisResult.title ? "default" : "destructive"}>
                        {analysisResult.title ? "✓" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meta Description</span>
                      <Badge variant={analysisResult.description ? "default" : "destructive"}>
                        {analysisResult.description ? "✓" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Open Graph Image</span>
                      <Badge variant={analysisResult.image_url ? "default" : "secondary"}>
                        {analysisResult.image_url ? "✓" : "None"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favicon</span>
                      <Badge variant={analysisResult.favicon_url ? "default" : "secondary"}>
                        {analysisResult.favicon_url ? "✓" : "None"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Page Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysisResult.title && (
                      <div>
                        <div className="text-xs text-muted-foreground">Title ({analysisResult.title.length} chars)</div>
                        <div className="text-sm font-medium truncate">{analysisResult.title}</div>
                      </div>
                    )}
                    {analysisResult.description && (
                      <div>
                        <div className="text-xs text-muted-foreground">Description ({analysisResult.description.length} chars)</div>
                        <div className="text-sm truncate">{analysisResult.description}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground truncate">{analysisResult.domain}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 bg-muted/50">
          <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">Site Audit</TabsTrigger>
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs">Tracking</TabsTrigger>
          <TabsTrigger value="backlinks" className="text-xs">Backlinks</TabsTrigger>
          <TabsTrigger value="competitors" className="text-xs">Competitors</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          <TabsTrigger value="ai-content" className="text-xs">AI Content</TabsTrigger>
          <TabsTrigger value="ml-predict" className="text-xs">ML Predict</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs">Automation</TabsTrigger>
          <TabsTrigger value="white-label" className="text-xs">White Label</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Platform Content Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {platformMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into key SEO tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab(action.tab)}
                  >
                    <action.icon className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: 'ai resume builder', position: 3, traffic: '12.5K' },
                    { keyword: 'job search platform', position: 7, traffic: '8.9K' },
                    { keyword: 'career guidance', position: 12, traffic: '5.2K' },
                    { keyword: 'remote jobs', position: 18, traffic: '3.1K' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{item.keyword}</div>
                        <div className="text-sm text-muted-foreground">Position #{item.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.traffic}</div>
                        <div className="text-sm text-muted-foreground">monthly traffic</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  SEO Issues to Fix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { issue: 'Missing meta descriptions', pages: 23, severity: 'medium' },
                    { issue: 'Slow page load times', pages: 8, severity: 'high' },
                    { issue: 'Broken internal links', pages: 12, severity: 'medium' },
                    { issue: 'Missing alt text', pages: 45, severity: 'low' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{item.issue}</div>
                        <div className="text-sm text-muted-foreground">{item.pages} pages affected</div>
                      </div>
                      <Badge variant={
                        item.severity === 'high' ? 'destructive' : 
                        item.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {item.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <SEOKeywordResearch />
        </TabsContent>

        <TabsContent value="audit">
          <SEOSiteAudit />
        </TabsContent>

        <TabsContent value="content">
          <SEOContentOptimizer />
        </TabsContent>

        <TabsContent value="tracking">
          <SEORankTracker />
        </TabsContent>

        <TabsContent value="backlinks">
          <SEOBacklinkAnalyzer />
        </TabsContent>

        <TabsContent value="competitors">
          <ConnectProviderCard 
            title="Competitor Analysis"
            description="Analyze competitor SEO strategies and performance"
            providerName="SEO Analysis Tools"
            onConnect={() => toast.info('Competitor analysis integration coming soon!')}
          />
        </TabsContent>

        <TabsContent value="reports">
          <SEOReporting />
        </TabsContent>

        <TabsContent value="ai-content">
          <AIContentGenerator />
        </TabsContent>

        <TabsContent value="ml-predict">
          <MLRankPredictor />
        </TabsContent>

        <TabsContent value="automation">
          <SEOAutomationEngine />
        </TabsContent>

        <TabsContent value="white-label">
          <WhiteLabelReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Connect Provider Component
const ConnectProviderCard = ({ 
  title, 
  description, 
  providerName, 
  onConnect 
}: {
  title: string;
  description: string;
  providerName: string;
  onConnect: () => void;
}) => (
  <Card className="max-w-md mx-auto">
    <CardHeader className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      <Button onClick={onConnect} className="w-full">
        <Link className="h-4 w-4 mr-2" />
        Connect {providerName}
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        Configure your API keys to access real-time data
      </p>
    </CardContent>
  </Card>
);

export default SEOSuite;