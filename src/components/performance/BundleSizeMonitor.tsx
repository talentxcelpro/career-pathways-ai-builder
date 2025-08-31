import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PerformanceBudgetMonitor, PERFORMANCE_TARGETS } from '@/utils/performanceBudget';

interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  violations: string[];
  score: 'good' | 'warning' | 'poor';
}

export const BundleSizeMonitor: React.FC = () => {
  const [bundleStats, setBundleStats] = useState<BundleStats>({
    totalSize: 0,
    gzippedSize: 0,
    violations: [],
    score: 'good'
  });

  useEffect(() => {
    const checkBundleSize = () => {
      // Estimate bundle size from navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navTiming) {
        const transferSize = navTiming.transferSize || 0;
        const estimatedJSSize = transferSize * 0.6; // Rough estimate for JS portion
        const gzippedSize = estimatedJSSize / 1024; // Convert to KB
        
        const violations = PerformanceBudgetMonitor.getViolations();
        
        const score = gzippedSize > PERFORMANCE_TARGETS.bundleSize * 1.5 ? 'poor' :
                     gzippedSize > PERFORMANCE_TARGETS.bundleSize ? 'warning' : 'good';
        
        setBundleStats({
          totalSize: transferSize / 1024,
          gzippedSize,
          violations,
          score
        });
      }
    };

    // Check after page load
    if (document.readyState === 'complete') {
      setTimeout(checkBundleSize, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkBundleSize, 1000);
      });
    }
  }, []);

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreBadgeColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = Math.min((bundleStats.gzippedSize / PERFORMANCE_TARGETS.bundleSize) * 100, 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bundle Size Monitor
          <Badge className={getScoreBadgeColor(bundleStats.score)}>
            {bundleStats.score.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>JS Bundle Size (Gzipped)</span>
            <span className={getScoreColor(bundleStats.score)}>
              {bundleStats.gzippedSize.toFixed(1)}KB / {PERFORMANCE_TARGETS.bundleSize}KB
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Transfer:</span>
            <p className="font-medium">{bundleStats.totalSize.toFixed(1)}KB</p>
          </div>
          <div>
            <span className="text-muted-foreground">Compression:</span>
            <p className="font-medium">
              {bundleStats.totalSize > 0 ? 
                ((1 - bundleStats.gzippedSize / bundleStats.totalSize) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {bundleStats.violations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Performance Violations:</h4>
            <div className="space-y-1">
              {bundleStats.violations.slice(0, 3).map((violation, index) => (
                <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {violation}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Target: ≤{PERFORMANCE_TARGETS.bundleSize}KB for optimal LCP</p>
          <p>• Use dynamic imports for heavy components</p>
          <p>• Run `npm run build:analyze` for detailed breakdown</p>
        </div>
      </CardContent>
    </Card>
  );
};