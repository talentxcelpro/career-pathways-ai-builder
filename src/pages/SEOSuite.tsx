import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { toast } from 'sonner';

const SEOKeywordResearch = lazy(() => import('@/components/seo/SEOKeywordResearch').then(m => ({ default: m.SEOKeywordResearch })));
const SEOSiteAudit = lazy(() => import('@/components/seo/SEOSiteAudit').then(m => ({ default: m.SEOSiteAudit })));
const SEOContentOptimizer = lazy(() => import('@/components/seo/SEOContentOptimizer').then(m => ({ default: m.SEOContentOptimizer })));
const SEORankTracker = lazy(() => import('@/components/seo/SEORankTracker').then(m => ({ default: m.SEORankTracker })));
const SEOBacklinkAnalyzer = lazy(() => import('@/components/seo/SEOBacklinkAnalyzer').then(m => ({ default: m.SEOBacklinkAnalyzer })));
const SEOCompetitorAnalysis = lazy(() => import('@/components/seo/SEOCompetitorAnalysis').then(m => ({ default: m.SEOCompetitorAnalysis })));
const SEOReporting = lazy(() => import('@/components/seo/SEOReporting').then(m => ({ default: m.SEOReporting })));
const SEOIssueManager = lazy(() => import('@/components/seo/SEOIssueManager').then(m => ({ default: m.SEOIssueManager })));
const RealTimeSEOAnalyzer = lazy(() => import('@/components/seo/advanced/RealTimeSEOAnalyzer').then(m => ({ default: m.RealTimeSEOAnalyzer })));
const PredictiveSEOInsights = lazy(() => import('@/components/seo/advanced/PredictiveSEOInsights').then(m => ({ default: m.PredictiveSEOInsights })));
const SEOAutomationWorkflows = lazy(() => import('@/components/seo/advanced/SEOAutomationWorkflows').then(m => ({ default: m.SEOAutomationWorkflows })));
const AdvancedCompetitorIntelligence = lazy(() => import('@/components/seo/enhanced/AdvancedCompetitorIntelligence').then(m => ({ default: m.AdvancedCompetitorIntelligence })));
const LocalSEOTracker = lazy(() => import('@/components/seo/enhanced/LocalSEOTracker').then(m => ({ default: m.LocalSEOTracker })));
const AIContentGenerator = lazy(() => import('@/components/seo/phase3/AIContentGenerator').then(m => ({ default: m.AIContentGenerator })));
const MLRankPredictor = lazy(() => import('@/components/seo/phase3/MLRankPredictor').then(m => ({ default: m.MLRankPredictor })));
const SEOAutomationEngine = lazy(() => import('@/components/seo/phase3/SEOAutomationEngine').then(m => ({ default: m.SEOAutomationEngine })));
const WhiteLabelReports = lazy(() => import('@/components/seo/phase3/WhiteLabelReports').then(m => ({ default: m.WhiteLabelReports })));
const EnterpriseAnalyticsDashboard = lazy(() => import('@/components/seo/phase4/EnterpriseAnalyticsDashboard').then(m => ({ default: m.EnterpriseAnalyticsDashboard })));
const AIProviderStatus = lazy(() => import('@/components/seo/phase4/AIProviderStatus').then(m => ({ default: m.AIProviderStatus })));
const TestSEOSuite = lazy(() => import('@/components/seo/TestSEOSuite').then(m => ({ default: m.TestSEOSuite })));
const LiveRankTracker = lazy(() => import('@/components/seo/real-time/LiveRankTracker').then(m => ({ default: m.LiveRankTracker })));
const RealTimeCompetitorAnalysis = lazy(() => import('@/components/seo/real-time/RealTimeCompetitorAnalysis').then(m => ({ default: m.RealTimeCompetitorAnalysis })));
const LiveSearchVolumeTracker = lazy(() => import('@/components/seo/real-time/LiveSearchVolumeTracker').then(m => ({ default: m.LiveSearchVolumeTracker })));
const ABTestingSEO = lazy(() => import('@/components/seo/advanced-features/ABTestingSEO').then(m => ({ default: m.ABTestingSEO })));
const HreflangManager = lazy(() => import('@/components/seo/advanced-features/HreflangManager').then(m => ({ default: m.HreflangManager })));
const GoogleSearchConsoleIntegration = lazy(() => import('@/components/seo/enterprise/GoogleSearchConsoleIntegration').then(m => ({ default: m.GoogleSearchConsoleIntegration })));
const DeploymentDiagnostics = lazy(() => import('@/components/admin/DeploymentDiagnostics').then(m => ({ default: m.DeploymentDiagnostics })));
const VoiceSearchOptimizer = lazy(() => import('@/components/seo/VoiceSearchOptimizer').then(m => ({ default: m.VoiceSearchOptimizer })));
const FeaturedSnippetsTargeting = lazy(() => import('@/components/seo/FeaturedSnippetsTargeting').then(m => ({ default: m.FeaturedSnippetsTargeting })));
const AIContentScaler = lazy(() => import('@/components/seo/AIContentScaler').then(m => ({ default: m.AIContentScaler })));
const PredictiveAnalytics = lazy(() => import('@/components/seo/PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));
const InternationalSEO = lazy(() => import('@/components/seo/advanced-features/InternationalSEO').then(m => ({ default: m.InternationalSEO })));

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
    
    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Show immediate feedback
      toast.info('Analyzing website metadata...');
      
      // Try to fetch metadata via edge function with timeout
      const metadataPromise = Promise.race([
        supabase.functions.invoke('url-metadata', {
          body: { url: websiteUrl }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
      ]);

      const { data, error } = await metadataPromise as any;

      let analysisData = null;

      if (error || !data) {
        console.warn('URL metadata error:', error);
        toast.warning('Using basic analysis - metadata service unavailable');
        
        // Fallback: Basic analysis using URL structure
        const urlObj = new URL(websiteUrl);
        analysisData = {
          url: websiteUrl,
          domain: urlObj.hostname,
          title: urlObj.hostname.replace('www.', ''),
          description: `Website analysis for ${urlObj.hostname}`,
          image_url: '',
          favicon_url: `${urlObj.protocol}//${urlObj.host}/favicon.ico`
        };
      } else {
        analysisData = data;
      }

      // Calculate SEO score based on available data
      let score = 30; // Base score
      if (analysisData.title && analysisData.title.length > 0) score += 20;
      if (analysisData.description && analysisData.description.length > 0) score += 20;
      if (analysisData.image_url) score += 15;
      if (analysisData.title && analysisData.title.length <= 60) score += 10;
      if (analysisData.description && analysisData.description.length <= 160) score += 5;

      setSeoScore(Math.min(score, 100));
      setAnalysisResult(analysisData);
      toast.success('SEO analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Final fallback - show basic info
      try {
        const urlObj = new URL(websiteUrl);
        const fallbackData = {
          url: websiteUrl,
          domain: urlObj.hostname,
          title: urlObj.hostname.replace('www.', ''),
          description: 'Basic analysis - unable to fetch detailed metadata',
          image_url: '',
          favicon_url: `${urlObj.protocol}//${urlObj.host}/favicon.ico`
        };
        
        setSeoScore(45); // Basic score for valid URL
        setAnalysisResult(fallbackData);
        toast.warning('Basic analysis completed - some features unavailable');
      } catch {
        toast.error('Failed to analyze website. Please check the URL and try again.');
        setSeoScore(0);
        setAnalysisResult(null);
      }
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
          <TabsTrigger value="voice-search" className="text-xs">Voice Search</TabsTrigger>
          <TabsTrigger value="snippets" className="text-xs">Snippets</TabsTrigger>
          <TabsTrigger value="ai-scaler" className="text-xs">AI Scaler</TabsTrigger>
          <TabsTrigger value="predictive" className="text-xs">Predictive</TabsTrigger>
          <TabsTrigger value="international" className="text-xs">International</TabsTrigger>
          <TabsTrigger value="live-rank" className="text-xs">Live Rank</TabsTrigger>
          <TabsTrigger value="live-volume" className="text-xs">Live Volume</TabsTrigger>
          <TabsTrigger value="real-competitor" className="text-xs">Live Competitor</TabsTrigger>
          <TabsTrigger value="ab-testing" className="text-xs">A/B Testing</TabsTrigger>
          <TabsTrigger value="hreflang" className="text-xs">Hreflang</TabsTrigger>
          <TabsTrigger value="gsc" className="text-xs">GSC Integration</TabsTrigger>
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
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
        </TabsList>

        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading module...</div>}>
          <TabsContent value="dashboard" className="space-y-6">
            <SEOIssueManager />
          </TabsContent>

          <TabsContent value="voice-search">
            <VoiceSearchOptimizer pageTitle="TalentXcel" pageType="general" />
          </TabsContent>

          <TabsContent value="snippets">
            <FeaturedSnippetsTargeting pageTitle="TalentXcel" pageType="general" />
          </TabsContent>

          <TabsContent value="ai-scaler">
            <AIContentScaler />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="international">
            <InternationalSEO currentUrl="https://talentxcel.in" />
          </TabsContent>

          <TabsContent value="live-rank">
            <LiveRankTracker />
          </TabsContent>

          <TabsContent value="live-volume">
            <LiveSearchVolumeTracker />
          </TabsContent>

          <TabsContent value="real-competitor">
            <RealTimeCompetitorAnalysis />
          </TabsContent>

          <TabsContent value="ab-testing">
            <ABTestingSEO />
          </TabsContent>

          <TabsContent value="hreflang">
            <HreflangManager />
          </TabsContent>

          <TabsContent value="gsc">
            <GoogleSearchConsoleIntegration />
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

          <TabsContent value="analytics">
            <EnterpriseAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="ai-status">
            <AIProviderStatus />
          </TabsContent>

          <TabsContent value="deployments">
            <DeploymentDiagnostics />
          </TabsContent>

          <TabsContent value="testing">
            <TestSEOSuite />
          </TabsContent>
        </Suspense>
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