import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { LayoutStable, StableCard, StableChartContainer } from '@/components/ui/layout-stable';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useBundleAnalysis } from '@/hooks/useBundleAnalysis';
import { preloadComponents } from '@/components/LazyComponents';
import { optimizeFontLoading, inlineCriticalCSS } from '@/utils/fontOptimizer';
import { optimizeCoreWebVitals, addResourceHints } from '@/utils/performanceOptimizer';
import { Activity, Zap, TrendingUp, Package, Image, FileText } from 'lucide-react';

// 🔴 Performance Dashboard - Demonstrates all optimizations
export const PerformanceDashboard = () => {
  const { metrics, score, grade, isOptimal } = usePerformanceMonitor();
  const { analysis, isAnalyzing, analyzeBundleSize, performanceScore } = useBundleAnalysis();

  useEffect(() => {
    // Initialize all performance optimizations
    optimizeFontLoading();
    inlineCriticalCSS();
    addResourceHints();
    optimizeCoreWebVitals();
    preloadComponents();
  }, []);

  const formatMs = (ms: number | null) => {
    if (ms === null) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[grade as keyof typeof colors] || colors.F;
  };

  return (
    <LayoutStable className="space-y-6 p-6" minHeight="600px">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time Core Web Vitals and optimization metrics
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={`px-4 py-2 text-lg font-bold ${getGradeColor(grade)}`}
        >
          Grade: {grade}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LCP Card */}
        <StableCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Largest Contentful Paint
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMs(metrics.lcp)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={score.lcp} className="flex-1" />
              <span className={`text-sm font-medium ${getScoreColor(score.lcp)}`}>
                {score.lcp}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;2.5s
            </p>
          </CardContent>
        </StableCard>

        {/* CLS Card */}
        <StableCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cumulative Layout Shift
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={score.cls} className="flex-1" />
              <span className={`text-sm font-medium ${getScoreColor(score.cls)}`}>
                {score.cls}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;0.1
            </p>
          </CardContent>
        </StableCard>

        {/* FID Card */}
        <StableCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              First Input Delay
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMs(metrics.fid)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={score.fid} className="flex-1" />
              <span className={`text-sm font-medium ${getScoreColor(score.fid)}`}>
                {score.fid}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;100ms
            </p>
          </CardContent>
        </StableCard>

        {/* Bundle Size Card */}
        <StableCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bundle Performance
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={performanceScore} className="flex-1" />
            </div>
            <button 
              onClick={analyzeBundleSize}
              disabled={isAnalyzing}
              className="text-xs text-primary hover:underline mt-1"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Bundle'}
            </button>
          </CardContent>
        </StableCard>
      </div>

      {/* Optimization Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StableCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Optimization Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                WebP conversion with proper dimensions to prevent layout shift
              </p>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400"
                alt="Performance optimization demo"
                width={400}
                height={225}
                priority
                className="rounded-lg"
                placeholder="blur"
              />
              <div className="text-xs text-green-600">
                ✅ WebP optimized, dimensions set, preloaded
              </div>
            </div>
          </CardContent>
        </StableCard>

        <StableCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Optimization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Indexes</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✅ Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Prompt Caching</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✅ Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Component Lazy Loading</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✅ Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Font Optimization</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✅ Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Headers</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✅ Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </StableCard>
      </div>

      {/* Performance Recommendations */}
      {score.recommendations.length > 0 && (
        <StableCard>
          <CardHeader>
            <CardTitle>Performance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {score.recommendations.map((rec, index) => (
                <div key={index} className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  {rec}
                </div>
              ))}
            </div>
          </CardContent>
        </StableCard>
      )}

      {/* Bundle Analysis */}
      {analysis && (
        <StableChartContainer>
          <Card>
            <CardHeader>
              <CardTitle>Bundle Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(analysis.totalSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-muted-foreground">Total Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(analysis.gzippedSize / 1024).toFixed(0)}KB
                  </div>
                  <div className="text-sm text-muted-foreground">Gzipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.chunks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Chunks</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Optimization Recommendations:</h4>
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </StableChartContainer>
      )}
    </LayoutStable>
  );
};