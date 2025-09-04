import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Activity, 
  Timer, 
  MemoryStick,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StateMetrics {
  storeSize: number;
  updateFrequency: number;
  renderCount: number;
  memoryUsage: number;
  subscriptions: number;
  lastUpdate: Date;
  performance: {
    avgUpdateTime: number;
    slowUpdates: number;
    errorCount: number;
  };
}

interface StateStore {
  name: string;
  size: number;
  updateCount: number;
  lastAccessed: Date;
  subscribers: number;
  type: 'zustand' | 'react' | 'custom';
}

interface AdvancedStateManagerProps {
  className?: string;
  enableMonitoring?: boolean;
  showPerformanceMetrics?: boolean;
  autoOptimize?: boolean;
}

// Mock store monitoring (would integrate with actual state management)
const mockStores: StateStore[] = [
  {
    name: 'auth',
    size: 1.2,
    updateCount: 45,
    lastAccessed: new Date(),
    subscribers: 12,
    type: 'zustand'
  },
  {
    name: 'ui',
    size: 2.8,
    updateCount: 156,
    lastAccessed: new Date(Date.now() - 5000),
    subscribers: 8,
    type: 'react'
  },
  {
    name: 'data',
    size: 5.4,
    updateCount: 89,
    lastAccessed: new Date(Date.now() - 2000),
    subscribers: 15,
    type: 'custom'
  }
];

export const AdvancedStateManager: React.FC<AdvancedStateManagerProps> = memo(({
  className,
  enableMonitoring = true,
  showPerformanceMetrics = true,
  autoOptimize = false
}) => {
  const [metrics, setMetrics] = useState<StateMetrics>({
    storeSize: 0,
    updateFrequency: 0,
    renderCount: 0,
    memoryUsage: 0,
    subscriptions: 0,
    lastUpdate: new Date(),
    performance: {
      avgUpdateTime: 0,
      slowUpdates: 0,
      errorCount: 0
    }
  });

  const [stores, setStores] = useState<StateStore[]>(mockStores);
  const [isMonitoring, setIsMonitoring] = useState(enableMonitoring);
  const [optimizationTips, setOptimizationTips] = useState<string[]>([]);

  // Performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const monitoringInterval = setInterval(() => {
      // Calculate total store size
      const totalSize = stores.reduce((sum, store) => sum + store.size, 0);
      
      // Calculate total subscriptions
      const totalSubs = stores.reduce((sum, store) => sum + store.subscribers, 0);
      
      // Mock performance metrics
      const avgUpdateTime = Math.random() * 10 + 2; // 2-12ms
      const slowUpdates = Math.floor(Math.random() * 3);
      const errorCount = Math.floor(Math.random() * 2);
      
      // Memory usage from performance API
      const memoryUsage = 'memory' in performance 
        ? (performance as any).memory.usedJSHeapSize / 1024 / 1024
        : totalSize * 2; // Fallback estimation

      setMetrics(prev => ({
        storeSize: totalSize,
        updateFrequency: Math.random() * 50 + 10,
        renderCount: prev.renderCount + Math.floor(Math.random() * 5),
        memoryUsage,
        subscriptions: totalSubs,
        lastUpdate: new Date(),
        performance: {
          avgUpdateTime,
          slowUpdates,
          errorCount
        }
      }));

      // Generate optimization tips
      const tips: string[] = [];
      if (totalSize > 10) tips.push('Consider splitting large stores');
      if (avgUpdateTime > 8) tips.push('Optimize state update logic');
      if (totalSubs > 30) tips.push('Review subscription patterns');
      if (errorCount > 0) tips.push('Fix state update errors');
      
      setOptimizationTips(tips);
    }, 2000);

    return () => clearInterval(monitoringInterval);
  }, [isMonitoring, stores]);

  const optimizeStores = useCallback(async () => {
    // Mock optimization process
    setStores(prev => prev.map(store => ({
      ...store,
      size: store.size * 0.9, // Reduce size by 10%
      subscribers: Math.max(1, store.subscribers - 1)
    })));
  }, []);

  const getStoreTypeIcon = (type: StateStore['type']) => {
    switch (type) {
      case 'zustand':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'react':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'custom':
        return <Activity className="h-4 w-4 text-purple-500" />;
    }
  };

  const getPerformanceStatus = () => {
    const { avgUpdateTime, slowUpdates, errorCount } = metrics.performance;
    
    if (errorCount > 0) return { status: 'error', color: 'destructive' };
    if (avgUpdateTime > 8 || slowUpdates > 2) return { status: 'warning', color: 'secondary' };
    return { status: 'good', color: 'default' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            State Manager
            <Badge 
              variant={performanceStatus.color as any}
              className="ml-2"
            >
              {performanceStatus.status}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isMonitoring ? 'default' : 'secondary'}
              className={cn(isMonitoring && 'animate-pulse')}
            >
              {isMonitoring ? 'Monitoring' : 'Paused'}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className="h-8 w-8 p-0"
            >
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Overview */}
        {showPerformanceMetrics && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Overview
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Avg Update</span>
                </div>
                <div className="text-lg font-semibold">
                  {metrics.performance.avgUpdateTime.toFixed(1)}ms
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <MemoryStick className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Memory</span>
                </div>
                <div className="text-lg font-semibold">
                  {metrics.memoryUsage.toFixed(1)}MB
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Updates/min</span>
                </div>
                <div className="text-lg font-semibold">
                  {Math.round(metrics.updateFrequency)}
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Subscribers</span>
                </div>
                <div className="text-lg font-semibold">
                  {metrics.subscriptions}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Store Overview */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Active Stores
          </h4>
          
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {stores.map((store, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    {getStoreTypeIcon(store.type)}
                    <div>
                      <div className="font-medium text-sm">{store.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {store.updateCount} updates • {store.subscribers} subscribers
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {store.size.toFixed(1)}KB
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {store.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Optimization Tips */}
        {optimizationTips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Optimization Tips
              </h4>
              
              {autoOptimize && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={optimizeStores}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Auto-optimize
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {optimizationTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-muted/30"
                >
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Store Health */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Store Health
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Efficiency</span>
                <span>{Math.max(0, 100 - metrics.memoryUsage * 2).toFixed(0)}%</span>
              </div>
              <Progress value={Math.max(0, 100 - metrics.memoryUsage * 2)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Update Performance</span>
                <span>{Math.max(0, 100 - metrics.performance.avgUpdateTime * 8).toFixed(0)}%</span>
              </div>
              <Progress value={Math.max(0, 100 - metrics.performance.avgUpdateTime * 8)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Subscription Efficiency</span>
                <span>{Math.max(0, 100 - metrics.subscriptions * 2).toFixed(0)}%</span>
              </div>
              <Progress value={Math.max(0, 100 - metrics.subscriptions * 2)} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AdvancedStateManager.displayName = 'AdvancedStateManager';