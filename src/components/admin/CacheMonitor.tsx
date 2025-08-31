import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCacheStats } from '@/hooks/useRedisCache';
import { cacheManager } from '@/utils/cacheManager';
import { 
  Activity, 
  Database, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Clock
} from 'lucide-react';

export function CacheMonitor() {
  const { stats, loading, refresh } = useCacheStats();

  const handleInvalidateAll = async () => {
    await Promise.all([
      cacheManager.invalidateJobsCache(),
      cacheManager.invalidateSearchCache(),
      cacheManager.invalidateAnalyticsCache()
    ]);
    refresh();
  };

  const handleWarmCache = async () => {
    await cacheManager.warmCache();
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cache Monitor</h2>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleWarmCache} variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Warm Cache
          </Button>
          <Button onClick={handleInvalidateAll} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.hitRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.hits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful cache lookups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.misses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Database queries required
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hit Rate</span>
                <span>{stats.hitRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.hitRate}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Requests:</span>
                <span className="ml-2 font-medium">
                  {(stats.hits + stats.misses).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cache Efficiency:</span>
                <span className={`ml-2 font-medium ${
                  stats.hitRate > 80 ? 'text-green-600' : 
                  stats.hitRate > 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.hitRate > 80 ? 'Excellent' : 
                   stats.hitRate > 60 ? 'Good' : 'Needs Optimization'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => cacheManager.invalidateJobsCache()}
            >
              Clear Jobs Cache
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => cacheManager.invalidateSearchCache()}
            >
              Clear Search Cache
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => cacheManager.invalidateAnalyticsCache()}
            >
              Clear Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWarmCache}
            >
              Warm Popular Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}