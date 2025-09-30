import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FunctionMetrics {
  name: string;
  total_calls: number;
  success_count: number;
  error_count: number;
  avg_response_time: number;
  last_success: string | null;
  last_error: string | null;
  success_rate: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface FunctionLog {
  id: string;
  function_name: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
  request_count: number;
  created_at: string;
}

export default function EdgeFunctionMonitor() {
  const [functionMetrics, setFunctionMetrics] = useState<FunctionMetrics[]>([]);
  const [recentLogs, setRecentLogs] = useState<FunctionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFunctionMetrics = async () => {
    try {
      // Get function health logs from last 24 hours
      const { data: logs } = await supabase
        .from('function_health_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (logs) {
        // Group logs by function name and calculate metrics
        const functionGroups = (logs as FunctionLog[]).reduce((acc, log) => {
          if (!acc[log.function_name]) {
            acc[log.function_name] = [];
          }
          acc[log.function_name].push(log);
          return acc;
        }, {} as Record<string, FunctionLog[]>);

        const metrics: FunctionMetrics[] = Object.entries(functionGroups).map(([name, functionLogs]) => {
          const totalCalls = functionLogs.reduce((sum, log) => sum + (log.request_count || 1), 0);
          const successCount = functionLogs.filter(log => log.status === 'success').length;
          const errorCount = functionLogs.filter(log => log.status === 'error').length;
          
          const responseTimes = functionLogs
            .filter(log => log.response_time_ms !== null)
            .map(log => log.response_time_ms!);
          
          const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
            : 0;

          const successRate = totalCalls > 0 ? (successCount / functionLogs.length) * 100 : 0;
          
          let status: 'healthy' | 'warning' | 'critical' = 'healthy';
          if (successRate < 50 || errorCount > 10) status = 'critical';
          else if (successRate < 85 || errorCount > 5) status = 'warning';

          const lastSuccess = functionLogs.find(log => log.status === 'success')?.created_at || null;
          const lastError = functionLogs.find(log => log.status === 'error')?.created_at || null;

          return {
            name,
            total_calls: totalCalls,
            success_count: successCount,
            error_count: errorCount,
            avg_response_time: avgResponseTime,
            last_success: lastSuccess,
            last_error: lastError,
            success_rate: successRate,
            status
          };
        });

        // Sort by total calls descending
        metrics.sort((a, b) => b.total_calls - a.total_calls);
        setFunctionMetrics(metrics);

        // Set recent logs (last 50 entries)
        setRecentLogs(logs.slice(0, 50));
      }
    } catch (error) {
      console.error('Failed to fetch function metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch edge function metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'timeout':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Timeout</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchFunctionMetrics();
    const interval = setInterval(fetchFunctionMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edge Function Monitor</h2>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalCalls = functionMetrics.reduce((sum, metric) => sum + metric.total_calls, 0);
  const totalErrors = functionMetrics.reduce((sum, metric) => sum + metric.error_count, 0);
  const avgSuccessRate = functionMetrics.length > 0 
    ? functionMetrics.reduce((sum, metric) => sum + metric.success_rate, 0) / functionMetrics.length 
    : 0;

  const criticalFunctions = functionMetrics.filter(f => f.status === 'critical').length;
  const warningFunctions = functionMetrics.filter(f => f.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edge Function Monitor</h2>
          <p className="text-muted-foreground">
            Monitoring {functionMetrics.length} active edge functions
          </p>
        </div>
        <Button onClick={fetchFunctionMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {functionMetrics.length} functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalFunctions}</div>
            <p className="text-xs text-muted-foreground">
              {warningFunctions} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="functions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="functions">Function Status</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function Status Overview</CardTitle>
              <CardDescription>Performance metrics for all edge functions in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {functionMetrics.map((metric) => (
                  <div 
                    key={metric.name} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedFunction(selectedFunction === metric.name ? null : metric.name)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.total_calls.toLocaleString()} calls • {metric.success_rate.toFixed(1)}% success
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{metric.avg_response_time.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">avg response</div>
                      </div>
                      <Badge 
                        variant={metric.status === 'healthy' ? 'default' : 'destructive'}
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedFunction && (
            <Card>
              <CardHeader>
                <CardTitle>Function Details: {selectedFunction}</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const func = functionMetrics.find(f => f.name === selectedFunction);
                  if (!func) return null;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{func.total_calls}</div>
                        <div className="text-sm text-muted-foreground">Total Calls</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{func.success_count}</div>
                        <div className="text-sm text-muted-foreground">Successful</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{func.error_count}</div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{func.avg_response_time.toFixed(0)}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Function Logs</CardTitle>
              <CardDescription>Latest 50 function execution logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-sm">{log.function_name}</span>
                        {getStatusBadge(log.status)}
                      </div>
                      {log.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                      {log.response_time_ms && (
                        <div className="text-xs">{log.response_time_ms}ms</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Functions</CardTitle>
                <CardDescription>Functions with best success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {functionMetrics
                    .filter(f => f.total_calls > 0)
                    .sort((a, b) => b.success_rate - a.success_rate)
                    .slice(0, 5)
                    .map((func) => (
                      <div key={func.name} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{func.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">{func.success_rate.toFixed(1)}%</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Functions Needing Attention</CardTitle>
                <CardDescription>Functions with issues or poor performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {functionMetrics
                    .filter(f => f.status !== 'healthy' || f.success_rate < 90)
                    .sort((a, b) => a.success_rate - b.success_rate)
                    .slice(0, 5)
                    .map((func) => (
                      <div key={func.name} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{func.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getStatusColor(func.status)}`}>
                            {func.success_rate.toFixed(1)}%
                          </span>
                          {getStatusIcon(func.status)}
                        </div>
                      </div>
                    ))}
                  {functionMetrics.every(f => f.status === 'healthy' && f.success_rate >= 90) && (
                    <div className="text-center text-muted-foreground py-4">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      All functions are performing well!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}