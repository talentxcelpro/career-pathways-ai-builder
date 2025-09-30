import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CostOptimizer } from '@/utils/costOptimizer';
import { 
  DollarSign, 
  Database, 
  Zap, 
  TrendingDown, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationResult {
  optimization: string;
  before_size_mb: number;
  after_size_mb: number;
  savings_mb: number;
  records_affected: number;
}

export const CostOptimizationDashboard = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [summary, setSummary] = useState({
    total_savings_mb: 0,
    total_records_affected: 0,
    estimated_cost_reduction_percent: 0,
    optimizations_applied: 0
  });
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0, hitRate: 0 });

  useEffect(() => {
    const fetchCacheStats = async () => {
      const stats = await CostOptimizer.getCacheStats();
      setCacheStats(stats);
    };
    
    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const runOptimization = async (action: string, name: string) => {
    setIsOptimizing(true);
    try {
      const result = await CostOptimizer.runOptimization(action);
      setResults(prev => [...prev, ...result.results]);
      setSummary(result.summary);
      toast.success(`${name} completed successfully`, {
        description: `Saved ${result.summary.total_savings_mb}MB, affected ${result.summary.total_records_affected} records`
      });
    } catch (error) {
      toast.error(`${name} failed`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const runFullOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await CostOptimizer.runDatabaseCleanup();
      setResults(result.results);
      setSummary(result.summary);
      toast.success('Full optimization completed!', {
        description: `Total savings: ${result.summary.total_savings_mb}MB (${result.summary.estimated_cost_reduction_percent}% cost reduction)`
      });
    } catch (error) {
      toast.error('Optimization failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearCache = async () => {
    await CostOptimizer.clearCache();
    const stats = await CostOptimizer.getCacheStats();
    setCacheStats(stats);
    toast.success('Cache cleared successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cost Optimization</h2>
          <p className="text-muted-foreground">
            Reduce infrastructure costs with smart optimizations
          </p>
        </div>
        <Button 
          onClick={runFullOptimization}
          disabled={isOptimizing}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Full Optimization
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.total_savings_mb.toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.estimated_cost_reduction_percent}% cost reduction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Cleaned</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_records_affected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Database records optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats.hits}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.hitRate.toFixed(1)}% hit rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.optimizations_applied}
            </div>
            <p className="text-xs text-muted-foreground">
              Applied successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Database Cleanup</CardTitle>
          <CardDescription>
            Remove old data to reduce storage costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => runOptimization('cleanup_notifications', 'Notification Cleanup')}
              disabled={isOptimizing}
              className="justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clean Notifications (352MB)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => runOptimization('cleanup_security_events', 'Security Events Cleanup')}
              disabled={isOptimizing}
              className="justify-start"
            >
              <Database className="w-4 h-4 mr-2" />
              Clean Security Events
            </Button>
            
            <Button
              variant="outline"
              onClick={() => runOptimization('deduplicate_profile_views', 'Profile Views Deduplication')}
              disabled={isOptimizing}
              className="justify-start"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Deduplicate Views (244MB)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => runOptimization('vacuum_database', 'Database Vacuum')}
              disabled={isOptimizing}
              className="justify-start"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Vacuum Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            Smart caching for reduced API calls and faster responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Query Cache Status</h4>
              <p className="text-sm text-muted-foreground">
                {cacheStats.hits} cache hits, {cacheStats.misses} misses
              </p>
            </div>
            <Button variant="outline" onClick={clearCache}>
              Clear Cache
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cache Hit Rate</span>
              <span className="font-medium">{cacheStats.hitRate.toFixed(1)}%</span>
            </div>
            <Progress value={cacheStats.hitRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              Recent optimization activities and their impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium capitalize">
                        {result.optimization.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.records_affected.toLocaleString()} records affected
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      -{result.savings_mb.toFixed(1)}MB
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.before_size_mb.toFixed(1)}MB → {result.after_size_mb.toFixed(1)}MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};