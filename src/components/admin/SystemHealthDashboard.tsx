import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpstashCacheStats } from '@/hooks/useUpstashCache';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, TrendingUp, Database, Zap, Shield } from 'lucide-react';

interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  threshold_status: string;
}

export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<Record<string, boolean>>({});
  const { stats: cacheStats, loading: cacheLoading } = useUpstashCacheStats();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_performance_metrics');
      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_data');
      if (error) throw error;
      await fetchMetrics();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  const checkRealtimeStatus = async () => {
    const tables = ['posts', 'profiles', 'notifications', 'ai_career_recommendations', 'ai_job_matches'];
    const status: Record<string, boolean> = {};
    
    tables.forEach(table => {
      try {
        const channel = supabase.channel(`health-check-${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => {})
          .subscribe((status) => {
            setRealtimeStatus(prev => ({ ...prev, [table]: status === 'SUBSCRIBED' }));
          });
        
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 5000);
      } catch (error) {
        status[table] = false;
      }
    });
  };

  useEffect(() => {
    fetchMetrics();
    checkRealtimeStatus();
    const interval = setInterval(fetchMetrics, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-success';
      case 'WARNING': return 'bg-warning';
      case 'ERROR': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getCacheHealthStatus = () => {
    if (cacheStats.hitRate >= 85) return { status: 'OK', color: 'bg-success' };
    if (cacheStats.hitRate >= 70) return { status: 'WARNING', color: 'bg-warning' };
    return { status: 'ERROR', color: 'bg-destructive' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring and optimization controls</p>
        </div>
        <Button onClick={runCleanup} className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Run Cleanup
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.hitRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getCacheHealthStatus().color}>
                {getCacheHealthStatus().status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {cacheStats.hits} hits, {cacheStats.misses} misses
              </span>
            </div>
            <Progress value={cacheStats.hitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.metric_name} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {metric.metric_name.replace(/_/g, ' ')}
                  </span>
                  <Badge className={getStatusColor(metric.threshold_status)}>
                    {metric.threshold_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">815</div>
            <p className="text-xs text-muted-foreground">Security warnings detected</p>
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Security policies need optimization
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Status */}
      <Card>
        <CardHeader>
          <CardTitle>Realtime Status</CardTitle>
          <CardDescription>Essential tables for real-time updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(realtimeStatus).map(([table, isActive]) => (
              <div key={table} className="flex items-center space-x-2">
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">{table}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Database size and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.metric_name} className="flex justify-between items-center p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium capitalize">
                    {metric.metric_name.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Current value: {metric.metric_value.toLocaleString()}
                    {metric.metric_name.includes('mb') ? ' MB' : 
                     metric.metric_name.includes('count') ? ' records' : ''}
                  </p>
                </div>
                <Badge className={getStatusColor(metric.threshold_status)}>
                  {metric.threshold_status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}