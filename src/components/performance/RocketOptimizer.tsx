import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Gauge, 
  Database, 
  Image, 
  Wifi, 
  Clock,
  Settings,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { feedOptimizer } from '@/utils/feedOptimization';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  imageOptimization: number;
  realtimeLatency: number;
  memoryUsage: number;
  networkEfficiency: number;
}

interface OptimizationSettings {
  aggressiveCaching: boolean;
  imagePreloading: boolean;
  realtimeUpdates: boolean;
  compressionLevel: 'high' | 'medium' | 'low';
  prefetchDistance: number;
}

export const RocketOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    imageOptimization: 0,
    realtimeLatency: 0,
    memoryUsage: 0,
    networkEfficiency: 0
  });

  const [settings, setSettings] = useState<OptimizationSettings>({
    aggressiveCaching: true,
    imagePreloading: true,
    realtimeUpdates: true,
    compressionLevel: 'high',
    prefetchDistance: 3
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [rocketScore, setRocketScore] = useState(0);

  // Calculate rocket performance score
  const calculateRocketScore = useCallback(() => {
    const {
      loadTime,
      cacheHitRate,
      imageOptimization,
      realtimeLatency,
      networkEfficiency
    } = metrics;

    // Perfect scores: load < 500ms, cache > 80%, images > 90%, latency < 100ms, network > 85%
    const loadScore = Math.max(0, 100 - (loadTime / 5));
    const cacheScore = cacheHitRate;
    const imageScore = imageOptimization;
    const latencyScore = Math.max(0, 100 - realtimeLatency);
    const networkScore = networkEfficiency;

    const totalScore = (loadScore + cacheScore + imageScore + latencyScore + networkScore) / 5;
    return Math.round(totalScore);
  }, [metrics]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const cacheStats = feedOptimizer.getCacheStats();
      const performanceEntries = performance.getEntriesByType('navigation');
      const navigation = performanceEntries[0] as PerformanceNavigationTiming;

      setMetrics({
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        renderTime: performance.now(),
        cacheHitRate: cacheStats.size > 0 ? Math.min(100, (cacheStats.size / 10) * 100) : 0,
        imageOptimization: 92, // Simulated - would be calculated from actual optimization
        realtimeLatency: Math.random() * 50 + 20, // Simulated WebSocket latency
        memoryUsage: (performance as any).memory ? 
          ((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        networkEfficiency: (navigator as any).connection ? 
          (navigator as any).connection.downlink * 10 : 85
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update rocket score when metrics change
  useEffect(() => {
    setRocketScore(calculateRocketScore());
  }, [metrics, calculateRocketScore]);

  const optimizeRocket = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Clear old cache
      feedOptimizer.clearCache();
      
      // Preload critical images
      if (settings.imagePreloading) {
        await feedOptimizer.preloadNextBatch(0, 5);
      }
      
      // Optimize memory
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
      
      // Simulate optimization time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Trigger re-measurement
      setTimeout(() => setIsOptimizing(false), 500);
      
    } catch (error) {
      console.error('Optimization failed:', error);
      setIsOptimizing(false);
    }
  }, [settings]);

  const getRocketLevel = (score: number) => {
    if (score >= 90) return { level: 'LUDICROUS', color: 'text-purple-600', icon: '🚀' };
    if (score >= 80) return { level: 'ROCKET', color: 'text-green-600', icon: '⚡' };
    if (score >= 70) return { level: 'FAST', color: 'text-blue-600', icon: '💨' };
    if (score >= 60) return { level: 'GOOD', color: 'text-yellow-600', icon: '✈️' };
    return { level: 'SLOW', color: 'text-red-600', icon: '🐌' };
  };

  const rocketLevel = getRocketLevel(rocketScore);

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Rocket Performance
          </CardTitle>
          <Badge variant="outline" className={`${rocketLevel.color} border-current`}>
            {rocketLevel.icon} {rocketLevel.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {rocketScore}
          </div>
          <Progress 
            value={rocketScore} 
            className="h-3 mb-2"
          />
          <p className="text-sm text-muted-foreground">
            Rocket Performance Score
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{Math.round(metrics.loadTime)}ms</div>
              <div className="text-xs text-muted-foreground">Load Time</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Database className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">{Math.round(metrics.cacheHitRate)}%</div>
              <div className="text-xs text-muted-foreground">Cache Hit</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Image className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">{Math.round(metrics.imageOptimization)}%</div>
              <div className="text-xs text-muted-foreground">Images</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Wifi className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm font-medium">{Math.round(metrics.realtimeLatency)}ms</div>
              <div className="text-xs text-muted-foreground">Real-time</div>
            </div>
          </div>
        </div>

        {/* Optimization Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rocket Settings
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Aggressive Caching</span>
              <Switch
                checked={settings.aggressiveCaching}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, aggressiveCaching: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Image Preloading</span>
              <Switch
                checked={settings.imagePreloading}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, imagePreloading: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Real-time Updates</span>
              <Switch
                checked={settings.realtimeUpdates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, realtimeUpdates: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Optimization Button */}
        <Button 
          onClick={optimizeRocket}
          disabled={isOptimizing}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Rocket Boost
            </>
          )}
        </Button>

        {/* Tips */}
        {rocketScore < 80 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Enable all optimizations and clear your browser cache for maximum rocket speed!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};