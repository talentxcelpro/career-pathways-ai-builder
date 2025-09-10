import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Zap, 
  Shield, 
  Search, 
  Image, 
  Link, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Smartphone,
  Monitor,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { SiteAuditSubcategories } from '@/components/seo/subcategories/SiteAuditSubcategories';

export const SEOSiteAudit = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  const auditResults = {
    overallScore: 78,
    technical: {
      score: 85,
      issues: [
        { type: 'error', title: 'Missing robots.txt', description: 'Your site lacks a robots.txt file', pages: 1 },
        { type: 'warning', title: 'Slow loading pages', description: '8 pages load slower than 3 seconds', pages: 8 },
        { type: 'success', title: 'HTTPS properly configured', description: 'All pages use secure HTTPS protocol', pages: 0 }
      ]
    },
    onPage: {
      score: 72,
      issues: [
        { type: 'error', title: 'Missing meta descriptions', description: '23 pages without meta descriptions', pages: 23 },
        { type: 'warning', title: 'Duplicate title tags', description: '5 pages have duplicate titles', pages: 5 },
        { type: 'warning', title: 'Missing alt attributes', description: '45 images without alt text', pages: 12 }
      ]
    },
    performance: {
      score: 68,
      metrics: {
        fcp: 2.1,
        lcp: 3.4,
        cls: 0.15,
        fid: 120
      }
    },
    mobile: {
      score: 82,
      issues: [
        { type: 'warning', title: 'Text too small', description: 'Some text is smaller than 12px', pages: 3 },
        { type: 'success', title: 'Mobile-friendly design', description: 'Site is mobile responsive', pages: 0 }
      ]
    }
  };

  const handleAudit = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsAuditing(true);
    setAuditProgress(0);

    // Simulate progressive audit steps
    const steps = [
      'Crawling website structure...',
      'Analyzing technical SEO...',
      'Checking on-page optimization...',
      'Testing page performance...',
      'Validating mobile compatibility...',
      'Generating recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuditProgress((i + 1) * (100 / steps.length));
      if (i < steps.length - 1) {
        toast.info(steps[i]);
      }
    }

    setIsAuditing(false);
    toast.success('Site audit completed successfully!');
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Subcategory Navigation */}
      <SiteAuditSubcategories />
      
      {/* Quick Site Audit Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Comprehensive Site Audit
          </CardTitle>
          <CardDescription>
            Complete technical SEO analysis with actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter website URL (e.g., https://example.com)"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAudit()}
              />
            </div>
            <Button onClick={handleAudit} disabled={isAuditing}>
              {isAuditing ? 'Auditing...' : 'Start Audit'}
            </Button>
          </div>
          
          {isAuditing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Audit Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(auditProgress)}%</span>
              </div>
              <Progress value={auditProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Results */}
      {auditProgress === 100 && (
        <>
          {/* Overall Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Overall SEO Score</h3>
                  <p className="text-muted-foreground">Based on 150+ SEO factors</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(auditResults.overallScore)}`}>
                    {auditResults.overallScore}/100
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {auditResults.overallScore >= 80 ? 'Excellent' : 
                     auditResults.overallScore >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>
              <Progress value={auditResults.overallScore} className="mt-4 h-3" />
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className={`text-2xl font-bold ${getScoreColor(auditResults.technical.score)}`}>
                  {auditResults.technical.score}
                </div>
                <div className="text-sm text-muted-foreground">Technical SEO</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className={`text-2xl font-bold ${getScoreColor(auditResults.onPage.score)}`}>
                  {auditResults.onPage.score}
                </div>
                <div className="text-sm text-muted-foreground">On-Page SEO</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className={`text-2xl font-bold ${getScoreColor(auditResults.performance.score)}`}>
                  {auditResults.performance.score}
                </div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className={`text-2xl font-bold ${getScoreColor(auditResults.mobile.score)}`}>
                  {auditResults.mobile.score}
                </div>
                <div className="text-sm text-muted-foreground">Mobile SEO</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="technical" className="space-y-6">
            <TabsList>
              <TabsTrigger value="technical">Technical SEO</TabsTrigger>
              <TabsTrigger value="onpage">On-Page SEO</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical SEO Issues</CardTitle>
                  <CardDescription>Infrastructure and crawlability issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditResults.technical.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          {issue.pages > 0 && (
                            <Badge variant="outline" className="mt-2">
                              {issue.pages} pages affected
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Fix This
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="onpage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>On-Page SEO Issues</CardTitle>
                  <CardDescription>Content and meta optimization issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditResults.onPage.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          {issue.pages > 0 && (
                            <Badge variant="outline" className="mt-2">
                              {issue.pages} pages affected
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Fix This
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Critical performance metrics that affect rankings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{auditResults.performance.metrics.fcp}s</div>
                      <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                      <Badge variant={auditResults.performance.metrics.fcp < 1.8 ? "default" : "destructive"} className="mt-2">
                        {auditResults.performance.metrics.fcp < 1.8 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{auditResults.performance.metrics.lcp}s</div>
                      <div className="text-sm text-muted-foreground">Largest Contentful Paint</div>
                      <Badge variant={auditResults.performance.metrics.lcp < 2.5 ? "default" : "destructive"} className="mt-2">
                        {auditResults.performance.metrics.lcp < 2.5 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Monitor className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{auditResults.performance.metrics.cls}</div>
                      <div className="text-sm text-muted-foreground">Cumulative Layout Shift</div>
                      <Badge variant={auditResults.performance.metrics.cls < 0.1 ? "default" : "destructive"} className="mt-2">
                        {auditResults.performance.metrics.cls < 0.1 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{auditResults.performance.metrics.fid}ms</div>
                      <div className="text-sm text-muted-foreground">First Input Delay</div>
                      <Badge variant={auditResults.performance.metrics.fid < 100 ? "default" : "destructive"} className="mt-2">
                        {auditResults.performance.metrics.fid < 100 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile SEO Issues</CardTitle>
                  <CardDescription>Mobile usability and optimization issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditResults.mobile.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          {issue.pages > 0 && (
                            <Badge variant="outline" className="mt-2">
                              {issue.pages} pages affected
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Fix This
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};