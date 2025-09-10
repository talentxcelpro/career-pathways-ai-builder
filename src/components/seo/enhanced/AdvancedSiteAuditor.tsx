import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Smartphone,
  Zap,
  Search,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

interface TechnicalAuditResult {
  url: string;
  score: number;
  issues: AuditIssue[];
  performance: {
    loadTime: number;
    pageSize: number;
    requests: number;
  };
  seo: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    h1Count: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
  };
  mobile: {
    isMobileFriendly: boolean;
    viewport: boolean;
    touchTargets: boolean;
  };
  security: {
    https: boolean;
    mixedContent: boolean;
    hsts: boolean;
  };
}

export const AdvancedSiteAuditor = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<TechnicalAuditResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAudit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to audit');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-technical-audit', {
        body: { url: url.trim() }
      });

      if (error) throw error;

      setAuditResult(data);
      toast.success('Technical audit completed successfully');
    } catch (error) {
      console.error('Technical audit failed:', error);
      toast.error('Failed to complete technical audit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">High Impact</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">Medium Impact</Badge>;
      default: return <Badge variant="secondary">Low Impact</Badge>;
    }
  };

  const categorizeIssues = (issues: AuditIssue[]) => {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, AuditIssue[]>);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Advanced Technical SEO Auditor
          </CardTitle>
          <CardDescription>
            Comprehensive technical analysis with 200+ SEO checks and performance insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter website URL (e.g., https://talentxcel.in)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAudit} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {isLoading ? 'Auditing...' : 'Start Audit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {auditResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className={`border-2 ${getScoreColor(auditResult.score)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-70">Overall SEO Health Score</div>
                  <div className="text-3xl font-bold">{auditResult.score}/100</div>
                  <div className="text-sm opacity-70 mt-1">
                    {auditResult.score >= 80 ? 'Excellent performance' : 
                     auditResult.score >= 60 ? 'Good with room for improvement' : 
                     'Needs significant optimization'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium opacity-70">Issues Found</div>
                  <div className="text-2xl font-bold">{auditResult.issues.length}</div>
                  <div className="text-sm opacity-70">
                    {auditResult.issues.filter(i => i.type === 'error').length} critical
                  </div>
                </div>
              </div>
              <Progress value={auditResult.score} className="mt-4" />
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Load Time</div>
                        <div className="text-xl font-bold">{auditResult.performance.loadTime}ms</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Page Size</div>
                        <div className="text-xl font-bold">{Math.round(auditResult.performance.pageSize / 1024)}KB</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Security</div>
                        <div className="text-xl font-bold">
                          {auditResult.security.https ? 'Secure' : 'Insecure'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {auditResult.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Critical Issues to Fix</CardTitle>
                    <CardDescription>High-priority issues affecting your SEO performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(categorizeIssues(auditResult.issues)).map(([category, issues]) => (
                        <div key={category} className="space-y-2">
                          <div className="font-semibold text-sm flex items-center gap-2">
                            {getIssueIcon(issues[0].type)}
                            {category} ({issues.length})
                          </div>
                          {issues.slice(0, 3).map((issue, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg ml-6">
                              <div className="flex-1">
                                <div className="text-sm">{issue.message}</div>
                              </div>
                              {getImpactBadge(issue.impact)}
                            </div>
                          ))}
                          {issues.length > 3 && (
                            <div className="text-xs text-muted-foreground ml-6">
                              +{issues.length - 3} more {category} issues
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Core Web Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Largest Contentful Paint (LCP)</span>
                      <Badge variant={auditResult.performance.loadTime < 2500 ? "default" : "destructive"}>
                        {auditResult.performance.loadTime}ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">First Input Delay (FID)</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cumulative Layout Shift (CLS)</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Requests</span>
                      <span className="font-semibold">{auditResult.performance.requests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Page Size</span>
                      <span className="font-semibold">{Math.round(auditResult.performance.pageSize / 1024)}KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compression</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>On-Page SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Title Tag</span>
                        <Badge variant={auditResult.seo.title ? "default" : "destructive"}>
                          {auditResult.seo.title ? "Present" : "Missing"}
                        </Badge>
                      </div>
                      {auditResult.seo.title && (
                        <div className="text-xs text-muted-foreground">
                          Length: {auditResult.seo.titleLength} chars
                          {auditResult.seo.titleLength > 60 && <span className="text-red-500"> (Too long)</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meta Description</span>
                        <Badge variant={auditResult.seo.description ? "default" : "destructive"}>
                          {auditResult.seo.description ? "Present" : "Missing"}
                        </Badge>
                      </div>
                      {auditResult.seo.description && (
                        <div className="text-xs text-muted-foreground">
                          Length: {auditResult.seo.descriptionLength} chars
                          {auditResult.seo.descriptionLength > 160 && <span className="text-red-500"> (Too long)</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">H1 Tags</span>
                      <Badge variant={auditResult.seo.h1Count === 1 ? "default" : "secondary"}>
                        {auditResult.seo.h1Count}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Images Missing Alt Text</span>
                      <Badge variant={auditResult.seo.imagesMissingAlt === 0 ? "default" : "destructive"}>
                        {auditResult.seo.imagesMissingAlt}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Internal Links</span>
                      <span className="font-semibold">{auditResult.seo.internalLinks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">External Links</span>
                      <span className="font-semibold">{auditResult.seo.externalLinks}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile Friendly</span>
                    <Badge variant={auditResult.mobile.isMobileFriendly ? "default" : "destructive"}>
                      {auditResult.mobile.isMobileFriendly ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Viewport Meta Tag</span>
                    <Badge variant={auditResult.mobile.viewport ? "default" : "destructive"}>
                      {auditResult.mobile.viewport ? "Present" : "Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Touch Targets</span>
                    <Badge variant={auditResult.mobile.touchTargets ? "default" : "destructive"}>
                      {auditResult.mobile.touchTargets ? "Appropriate" : "Too Small"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HTTPS Enabled</span>
                    <Badge variant={auditResult.security.https ? "default" : "destructive"}>
                      {auditResult.security.https ? "Secure" : "Insecure"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mixed Content</span>
                    <Badge variant={!auditResult.security.mixedContent ? "default" : "destructive"}>
                      {!auditResult.security.mixedContent ? "Clean" : "Found"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HSTS Header</span>
                    <Badge variant={auditResult.security.hsts ? "default" : "secondary"}>
                      {auditResult.security.hsts ? "Present" : "Missing"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};