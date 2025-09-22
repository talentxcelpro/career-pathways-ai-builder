import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { useSEOAudit } from '@/hooks/useSEOAudit';
import { performanceCore } from '@/utils/performanceCore';

export const SEODashboard: React.FC = () => {
  const { auditResult, isAuditing, refreshAudit } = useSEOAudit();
  const [performanceScore, setPerformanceScore] = React.useState<number>(0);
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  React.useEffect(() => {
    const checkPerformance = async () => {
      try {
        const result = await performanceCore.getMetrics();
        setPerformanceScore(Math.round(100 - (result.lcp / 100) - (result.cls * 100)));
      } catch (error) {
        console.error('Performance check failed:', error);
      }
    };

    checkPerformance();
  }, []);

  const optimizeNow = async () => {
    setIsOptimizing(true);
    try {
      // Run optimizations
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate optimization
      await refreshAudit();
      const result = await performanceCore.getMetrics();
      setPerformanceScore(Math.round(100 - (result.lcp / 100) - (result.cls * 100)));
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, text: 'Excellent' };
    if (score >= 70) return { variant: 'secondary' as const, text: 'Good' };
    return { variant: 'destructive' as const, text: 'Needs Work' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">SEO Performance Dashboard</h2>
        <Button onClick={optimizeNow} disabled={isOptimizing}>
          {isOptimizing ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Optimize Now
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall SEO Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(auditResult?.score || 0)}>
                {auditResult?.score || 0}/100
              </span>
            </div>
            <Badge {...getScoreBadge(auditResult?.score || 0)}>
              {getScoreBadge(auditResult?.score || 0).text}
            </Badge>
            <Progress value={auditResult?.score || 0} className="mt-2" />
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(performanceScore)}>
                {performanceScore}/100
              </span>
            </div>
            <Badge {...getScoreBadge(performanceScore)}>
              {getScoreBadge(performanceScore).text}
            </Badge>
            <Progress value={performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditResult?.issues.filter(issue => issue.type === 'critical').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues requiring immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Metrics */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>Page Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${auditResult.pageMetrics.hasTitle ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Title Tag</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${auditResult.pageMetrics.hasDescription ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Meta Description</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${auditResult.pageMetrics.hasCanonical ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Canonical URL</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${auditResult.pageMetrics.hasStructuredData ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Structured Data</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Images with Alt Text</span>
              <Badge variant={auditResult.pageMetrics.imagesWithoutAlt === 0 ? "default" : "destructive"}>
                {auditResult.pageMetrics.totalImages - auditResult.pageMetrics.imagesWithoutAlt}/{auditResult.pageMetrics.totalImages}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Page Load Time</span>
              <Badge variant={auditResult.pageMetrics.loadTime < 3 ? "default" : "destructive"}>
                {auditResult.pageMetrics.loadTime.toFixed(2)}s
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues & Recommendations */}
      {auditResult && auditResult.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditResult.issues.slice(0, 5).map((issue, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    issue.type === 'critical' ? 'text-red-500' : 
                    issue.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-xs text-muted-foreground mt-1">{issue.fix}</p>
                    )}
                  </div>
                  <Badge variant={
                    issue.type === 'critical' ? 'destructive' : 
                    issue.type === 'warning' ? 'secondary' : 'outline'
                  }>
                    {issue.type}
                  </Badge>
                </div>
              ))}
            </div>

            {auditResult.recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {auditResult.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAuditing && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            <span>Running SEO audit...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};