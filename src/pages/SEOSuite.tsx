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
  ArrowRight
} from 'lucide-react';
import { SEOKeywordResearch } from '@/components/seo/SEOKeywordResearch';
import { SEOSiteAudit } from '@/components/seo/SEOSiteAudit';
import { SEOContentOptimizer } from '@/components/seo/SEOContentOptimizer';
import { SEORankTracker } from '@/components/seo/SEORankTracker';
import { SEOBacklinkAnalyzer } from '@/components/seo/SEOBacklinkAnalyzer';
import { SEOCompetitorAnalysis } from '@/components/seo/SEOCompetitorAnalysis';
import { SEOReporting } from '@/components/seo/SEOReporting';
import { toast } from 'sonner';

const SEOSuite = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [seoScore, setSeoScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Simulate SEO score calculation
  useEffect(() => {
    if (seoScore < 85) {
      const timer = setInterval(() => {
        setSeoScore(prev => Math.min(prev + 1, 85));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [seoScore]);

  const handleQuickAnalysis = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }
    
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSeoScore(Math.floor(Math.random() * 40) + 60); // Random score between 60-100
    setIsAnalyzing(false);
    toast.success('SEO analysis completed!');
  };

  const seoMetrics = [
    { label: 'Organic Traffic', value: '2.4M', change: '+12%', positive: true },
    { label: 'Keywords Ranking', value: '1,847', change: '+8%', positive: true },
    { label: 'Backlinks', value: '12.5K', change: '+23%', positive: true },
    { label: 'Domain Authority', value: '72', change: '-2', positive: false },
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
          {seoScore > 0 && (
            <div className="mt-6 p-4 bg-white/50 rounded-lg">
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
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-muted/50">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="audit">Site Audit</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* SEO Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {seoMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <Badge variant={metric.positive ? "default" : "destructive"}>
                      {metric.change}
                    </Badge>
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
          <SEOCompetitorAnalysis />
        </TabsContent>

        <TabsContent value="reports">
          <SEOReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOSuite;