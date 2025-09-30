import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  cpu_usage: number;
  memory_usage: number;
  queue_depth: number;
  error_rate: number;
  processing_speed: number;
  last_updated: string;
}

interface ProcessingMetrics {
  timestamp: string;
  files_processed: number;
  success_rate: number;
  avg_processing_time: number;
  errors: number;
}

export const ProcessingMonitor = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // System health monitoring
  const { data: systemHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      const { data, error } = await supabase.functions.invoke('get-system-health');
      if (error) throw error;
      return data || {
        status: 'healthy',
        cpu_usage: 0,
        memory_usage: 0,
        queue_depth: 0,
        error_rate: 0,
        processing_speed: 0,
        last_updated: new Date().toISOString()
      };
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Processing metrics over time
  const { data: metricsData, refetch: refetchMetrics } = useQuery({
    queryKey: ['processing-metrics'],
    queryFn: async (): Promise<ProcessingMetrics[]> => {
      const { data, error } = await supabase.functions.invoke('get-processing-metrics', {
        body: { timeRange: '24h', interval: '1h' }
      });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: autoRefresh ? 30000 : false, // Less frequent for charts
  });

  // Recent error logs
  const { data: errorLogs, refetch: refetchErrors } = useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-error-logs', {
        body: { limit: 50 }
      });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusBadge = (status: string) => {
    const variants = {
      'healthy': 'secondary' as const,
      'warning': 'outline' as const,
      'error': 'destructive' as const
    };
    return variants[status] || 'outline';
  };

  const downloadErrorLog = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-error-logs', {
        body: { format: 'csv', timeRange: '24h' }
      });
      if (error) throw error;
      
      // Create download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `error-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Failed to download error log:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className={`h-5 w-5 ${getHealthStatusColor(systemHealth?.status || 'healthy')}`} />
              <div>
                <p className="font-semibold">System Status</p>
                <Badge variant={getHealthStatusBadge(systemHealth?.status || 'healthy')}>
                  {systemHealth?.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{systemHealth?.cpu_usage || 0}%</p>
                <p className="text-xs text-muted-foreground">CPU Usage</p>
                <Progress value={systemHealth?.cpu_usage || 0} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{systemHealth?.memory_usage || 0}%</p>
                <p className="text-xs text-muted-foreground">Memory</p>
                <Progress value={systemHealth?.memory_usage || 0} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-lg font-bold">{systemHealth?.queue_depth || 0}</p>
                <p className="text-xs text-muted-foreground">Queue Depth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{systemHealth?.processing_speed || 0}</p>
                <p className="text-xs text-muted-foreground">Files/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Metrics Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Processing Performance (24h)</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchMetrics();
                refetchHealth();
                refetchErrors();
              }}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Auto-refresh:</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(1) : value,
                    name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="files_processed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Files Processed"
                />
                <Line 
                  type="monotone" 
                  dataKey="success_rate" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth={2}
                  name="Success Rate %"
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_processing_time" 
                  stroke="hsl(47 96% 53%)" 
                  strokeWidth={2}
                  name="Avg Time (s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Error Monitoring */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Recent Errors & Issues
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={systemHealth?.error_rate && systemHealth.error_rate > 5 ? 'destructive' : 'secondary'}>
              {systemHealth?.error_rate || 0}% Error Rate
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadErrorLog}
              className="gap-2"
            >
              <Download className="h-3 w-3" />
              Export Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errorLogs?.map((error: any, index: number) => (
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <p className="font-medium text-red-800">{error.error_type || 'Processing Error'}</p>
                    <Badge variant="outline" className="text-xs">
                      {error.severity || 'medium'}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {new Date(error.timestamp).toLocaleString()} • File: {error.filename || 'Unknown'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // View detailed error info
                    console.log('Error details:', error);
                  }}
                  className="gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Details
                </Button>
              </div>
            ))}
            
            {(!errorLogs || errorLogs.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                No recent errors found - system is running smoothly!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};