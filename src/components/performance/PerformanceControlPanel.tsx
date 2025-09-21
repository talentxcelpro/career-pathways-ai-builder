import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { useAdvancedCaching } from '@/hooks/useAdvancedCaching';
import { useCriticalRenderingPath } from '@/hooks/useCriticalRenderingPath';

export const PerformanceControlPanel: React.FC = () => {
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'loading' | 'registered' | 'error'>('loading');
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  
  const { trackUserInteraction } = usePerformanceAnalytics();
  const { getCacheStats, invalidate } = useAdvancedCaching();
  const { criticalResourcesLoaded } = useCriticalRenderingPath();

  // Check service worker status
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then(registration => {
          setServiceWorkerStatus(registration ? 'registered' : 'error');
        })
        .catch(() => setServiceWorkerStatus('error'));
    } else {
      setServiceWorkerStatus('error');
    }
  }, []);

  // Update cache stats
  useEffect(() => {
    const updateStats = () => {
      const stats = getCacheStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [getCacheStats]);

  // Calculate performance score
  useEffect(() => {
    const calculateScore = () => {
      let score = 0;
      
      // Service Worker (+20 points)
      if (serviceWorkerStatus === 'registered') score += 20;
      
      // Critical resources loaded (+15 points)
      if (criticalResourcesLoaded) score += 15;
      
      // Cache efficiency (+25 points)
      if (cacheStats && cacheStats.hitRate > 0.8) score += 25;
      else if (cacheStats && cacheStats.hitRate > 0.6) score += 15;
      else if (cacheStats && cacheStats.hitRate > 0.4) score += 10;
      
      // Memory usage (+20 points)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (memoryRatio < 0.5) score += 20;
        else if (memoryRatio < 0.7) score += 15;
        else if (memoryRatio < 0.85) score += 10;
      } else {
        score += 10; // Default if memory API not available
      }
      
      // Network connection (+20 points)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === '4g') score += 20;
        else if (connection.effectiveType === '3g') score += 15;
        else score += 5;
      } else {
        score += 15; // Default if connection API not available
      }
      
      setPerformanceScore(Math.min(score, 100));
    };

    calculateScore();
  }, [serviceWorkerStatus, criticalResourcesLoaded, cacheStats]);

  const handleClearCache = () => {
    invalidate();
    trackUserInteraction('clear_cache', 'performance_panel');
    
    // Also clear browser caches if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  };

  const handleTestPerformance = () => {
    trackUserInteraction('test_performance', 'performance_panel');
    
    // Run a quick performance test
    const start = performance.now();
    
    // Simulate some work
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    alert(`Performance test completed in ${duration.toFixed(2)}ms`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'destructive';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Score</span>
            <Badge variant={getScoreColor(performanceScore) as any}>
              {getScoreGrade(performanceScore)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{performanceScore}</div>
              <Progress value={performanceScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Service Worker</span>
                <Badge variant={serviceWorkerStatus === 'registered' ? 'success' : 'destructive'}>
                  {serviceWorkerStatus === 'registered' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Critical Resources</span>
                <Badge variant={criticalResourcesLoaded ? 'success' : 'warning'}>
                  {criticalResourcesLoaded ? 'Loaded' : 'Loading'}
                </Badge>
              </div>
              
              {cacheStats && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium">
                      {Math.round(cacheStats.hitRate * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Cache Entries</span>
                    <span className="font-medium">{cacheStats.totalEntries}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Entries</div>
                <div className="text-2xl font-bold">{cacheStats.totalEntries}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Valid Entries</div>
                <div className="text-2xl font-bold text-green-600">{cacheStats.validEntries}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Stale Entries</div>
                <div className="text-2xl font-bold text-orange-600">{cacheStats.staleEntries}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cache Size</div>
                <div className="text-2xl font-bold">
                  {Math.round(cacheStats.estimatedSizeBytes / 1024)}KB
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleClearCache}
              variant="outline"
              size="sm"
            >
              Clear Cache
            </Button>
            
            <Button 
              onClick={handleTestPerformance}
              variant="outline"
              size="sm"
            >
              Test Performance
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Force Reload
            </Button>
            
            {serviceWorkerStatus === 'registered' && (
              <Button 
                onClick={() => {
                  navigator.serviceWorker.getRegistration().then(reg => {
                    reg?.update();
                  });
                }}
                variant="outline"
                size="sm"
              >
                Update SW
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Development Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>Node Environment: {process.env.NODE_ENV}</div>
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              {('connection' in navigator) && (
                <div>
                  Connection: {(navigator as any).connection.effectiveType} 
                  ({(navigator as any).connection.downlink}Mbps)
                </div>
              )}
              {('memory' in performance) && (
                <div>
                  Memory: {Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB used
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};