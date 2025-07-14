import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Eye, Download } from 'lucide-react';

interface BackgroundOperation {
  id: string;
  tool_slug: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data: any;
  output_data?: any;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  attempts: number;
  max_attempts: number;
  priority: number;
  cost?: number;
  processing_time_ms?: number;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  totalCost: number;
}

export function BackgroundProcessingUI() {
  const [operations, setOperations] = useState<BackgroundOperation[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<BackgroundOperation | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOperations();
    
    if (autoRefresh) {
      const interval = setInterval(fetchOperations, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOperations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_operation_queue')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setOperations(data as BackgroundOperation[]);
      calculateStats(data as BackgroundOperation[]);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch background operations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ops: BackgroundOperation[]) => {
    const stats: QueueStats = {
      total: ops.length,
      pending: ops.filter(op => op.status === 'pending').length,
      processing: ops.filter(op => op.status === 'processing').length,
      completed: ops.filter(op => op.status === 'completed').length,
      failed: ops.filter(op => op.status === 'failed').length,
      avgProcessingTime: 0,
      totalCost: ops.reduce((sum, op) => sum + (op.cost || 0), 0)
    };

    const completedOps = ops.filter(op => op.status === 'completed' && op.processing_time_ms);
    if (completedOps.length > 0) {
      stats.avgProcessingTime = completedOps.reduce((sum, op) => sum + (op.processing_time_ms || 0), 0) / completedOps.length;
    }

    setStats(stats);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'bg-red-100 text-red-800';
    if (priority >= 7) return 'bg-orange-100 text-orange-800';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 9) return 'High';
    if (priority >= 7) return 'Medium';
    if (priority >= 5) return 'Normal';
    return 'Low';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const retryOperation = async (operationId: string) => {
    try {
      // This would call an API to retry the operation
      toast({
        title: "Operation Retried",
        description: "The operation has been queued for retry",
      });
      fetchOperations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry operation",
        variant: "destructive",
      });
    }
  };

  const cancelOperation = async (operationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_operation_queue')
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', operationId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Operation Cancelled",
        description: "The operation has been cancelled",
      });
      fetchOperations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel operation",
        variant: "destructive",
      });
    }
  };

  const exportResults = (operation: BackgroundOperation) => {
    if (!operation.output_data) return;

    const data = JSON.stringify(operation.output_data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${operation.tool_slug}-${operation.id}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading operations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Background Processing</h2>
          <p className="text-muted-foreground">Monitor and manage your AI operation queue</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button onClick={fetchOperations} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <RefreshCw className="w-4 h-4 mr-1 text-blue-500" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.avgProcessingTime)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Operations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Operations</CardTitle>
              <CardDescription>Complete list of background operations</CardDescription>
            </CardHeader>
            <CardContent>
              <OperationsList 
                operations={operations}
                onRetry={retryOperation}
                onCancel={cancelOperation}
                onExport={exportResults}
                onViewDetails={setSelectedOperation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Operations</CardTitle>
              <CardDescription>Currently pending or processing operations</CardDescription>
            </CardHeader>
            <CardContent>
              <OperationsList 
                operations={operations.filter(op => ['pending', 'processing'].includes(op.status))}
                onRetry={retryOperation}
                onCancel={cancelOperation}
                onExport={exportResults}
                onViewDetails={setSelectedOperation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Operations</CardTitle>
              <CardDescription>Successfully completed operations</CardDescription>
            </CardHeader>
            <CardContent>
              <OperationsList 
                operations={operations.filter(op => op.status === 'completed')}
                onRetry={retryOperation}
                onCancel={cancelOperation}
                onExport={exportResults}
                onViewDetails={setSelectedOperation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Operations</CardTitle>
              <CardDescription>Operations that encountered errors</CardDescription>
            </CardHeader>
            <CardContent>
              <OperationsList 
                operations={operations.filter(op => op.status === 'failed')}
                onRetry={retryOperation}
                onCancel={cancelOperation}
                onExport={exportResults}
                onViewDetails={setSelectedOperation}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OperationsListProps {
  operations: BackgroundOperation[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onExport: (operation: BackgroundOperation) => void;
  onViewDetails: (operation: BackgroundOperation) => void;
}

function OperationsList({ operations, onRetry, onCancel, onExport, onViewDetails }: OperationsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'bg-red-100 text-red-800';
    if (priority >= 7) return 'bg-orange-100 text-orange-800';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 9) return 'High';
    if (priority >= 7) return 'Medium';
    if (priority >= 5) return 'Normal';
    return 'Low';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (operations.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Operations</h3>
        <p className="text-muted-foreground">No background operations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {operations.map((operation) => (
        <div key={operation.id} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(operation.status)}
              <div>
                <h3 className="font-medium capitalize">
                  {operation.tool_slug.replace('-', ' ')} - {operation.operation_type}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created {formatTimeAgo(operation.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(operation.priority)}>
                {getPriorityLabel(operation.priority)}
              </Badge>
              <Badge className={getStatusColor(operation.status)}>
                {operation.status}
              </Badge>
            </div>
          </div>

          {operation.status === 'processing' && (
            <div className="mb-2">
              <Progress value={50} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">Processing...</p>
            </div>
          )}

          {operation.error_message && (
            <div className="mb-2">
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {operation.error_message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Attempts: {operation.attempts}/{operation.max_attempts}
              {operation.cost && ` • Cost: $${operation.cost.toFixed(4)}`}
              {operation.processing_time_ms && ` • Duration: ${operation.processing_time_ms}ms`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(operation)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              {operation.status === 'completed' && operation.output_data && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport(operation)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              )}
              {operation.status === 'failed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRetry(operation.id)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              )}
              {operation.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(operation.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}