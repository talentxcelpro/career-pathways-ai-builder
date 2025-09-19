import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Activity, Clock, AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const EdgeFunctionsMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch function health logs
  const { data: healthLogs, isLoading } = useQuery({
    queryKey: ['function-health-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('function_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch function alerts
  const { data: alerts } = useQuery({
    queryKey: ['function-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('function_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000
  });

  // Get unique function names
  const functions = Array.from(new Set(healthLogs?.map(log => log.function_name) || []));

  // Calculate stats
  const stats = {
    totalFunctions: functions.length,
    healthyFunctions: functions.filter(fn => {
      const latestLog = healthLogs?.find(log => log.function_name === fn);
      return latestLog?.status === 'success';
    }).length,
    activeAlerts: alerts?.length || 0,
    averageResponseTime: healthLogs?.length ? 
      Math.round(healthLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / healthLogs.length) : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'timeout':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredLogs = healthLogs?.filter(log => 
    log.function_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edge Functions Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and debug all edge functions in real-time
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Total Functions</h3>
                <p className="text-2xl font-bold text-primary">{stats.totalFunctions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Healthy Functions</h3>
                <p className="text-2xl font-bold text-primary">{stats.healthyFunctions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-red-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Active Alerts</h3>
                <p className="text-2xl font-bold text-primary">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Avg Response Time</h3>
                <p className="text-2xl font-bold text-primary">{stats.averageResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Function Overview</TabsTrigger>
          <TabsTrigger value="logs">Health Logs</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Function Status Overview</CardTitle>
              <CardDescription>Current health status of all edge functions</CardDescription>
            </CardHeader>
            <CardContent>
              {functions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No functions found. Functions will appear here once they start logging health data.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {functions.map((functionName) => {
                    const latestLog = healthLogs?.find(log => log.function_name === functionName);
                    const functionLogs = healthLogs?.filter(log => log.function_name === functionName) || [];
                    const successRate = functionLogs.length > 0 ? 
                      (functionLogs.filter(log => log.status === 'success').length / functionLogs.length) * 100 : 0;

                    return (
                      <Card key={functionName} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{functionName}</h3>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(latestLog?.status || 'unknown')}`} />
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Success Rate: {successRate.toFixed(1)}%</p>
                            <p>Requests: {functionLogs.reduce((sum, log) => sum + (log.request_count || 1), 0)}</p>
                            <p>Avg Response: {functionLogs.length > 0 ? 
                              Math.round(functionLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / functionLogs.length) : 0}ms</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Logs</CardTitle>
              <CardDescription>Recent function execution logs and health checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">Search Logs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by function name or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading logs...</div>
              ) : filteredLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No logs found matching your search criteria.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLogs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                        <div>
                          <p className="font-medium">{log.function_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        {log.response_time_ms && (
                          <p className="text-sm text-muted-foreground mt-1">{log.response_time_ms}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Critical issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts. All functions are operating normally.
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts?.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{alert.function_name}</h3>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Function performance analysis and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Performance charts and detailed metrics will be available here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EdgeFunctionsMonitor;