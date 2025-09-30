import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  estimated_time: number;
  processing_rate: number;
}

interface QueueBatch {
  id: string;
  batch_name: string;
  total_files: number;
  processing_status: string;
  created_at: string;
  completed_at?: string;
  error_log?: any;
}

export const BulkUploadQueueManager = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchSize, setBatchSize] = useState(2000);
  const [concurrentJobs, setConcurrentJobs] = useState(5);
  
  const queryClient = useQueryClient();

  // Get queue statistics
  const { data: queueStats, refetch: refetchStats } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: async (): Promise<QueueStats> => {
      const { data, error } = await supabase.functions.invoke('get-queue-stats');
      if (error) throw error;
      return data || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        estimated_time: 0,
        processing_rate: 0
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get processing batches
  const { data: batches, refetch: refetchBatches } = useQuery({
    queryKey: ['processing-batches'],
    queryFn: async (): Promise<QueueBatch[]> => {
      const { data, error } = await supabase
        .from('bulk_upload_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 3000,
  });

  // Start queue processing
  const startProcessing = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('start-queue-processing', {
        body: { 
          batchSize, 
          concurrentJobs,
          priority: 'high'
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsProcessing(true);
      toast.success('Queue processing started successfully');
      refetchStats();
      refetchBatches();
    },
    onError: (error: any) => {
      toast.error(`Failed to start processing: ${error.message}`);
    }
  });

  // Stop queue processing
  const stopProcessing = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('stop-queue-processing');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsProcessing(false);
      toast.success('Queue processing stopped');
      refetchStats();
    },
    onError: (error: any) => {
      toast.error(`Failed to stop processing: ${error.message}`);
    }
  });

  // Pause/Resume processing
  const pauseProcessing = useMutation({
    mutationFn: async (action: 'pause' | 'resume') => {
      const { data, error } = await supabase.functions.invoke('control-queue-processing', {
        body: { action }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, action) => {
      toast.success(`Queue processing ${action}d`);
      refetchStats();
    }
  });

  // Retry failed items
  const retryFailed = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('retry-failed-queue-items');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Failed items queued for retry');
      refetchStats();
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'outline' as const, color: 'text-blue-600' },
      'processing': { variant: 'default' as const, color: 'text-yellow-600' },
      'completed': { variant: 'secondary' as const, color: 'text-green-600' },
      'failed': { variant: 'destructive' as const, color: 'text-red-600' },
      'paused': { variant: 'outline' as const, color: 'text-gray-600' }
    };
    return statusMap[status] || { variant: 'outline' as const, color: 'text-gray-600' };
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const calculateProgress = () => {
    if (!queueStats || queueStats.total === 0) return 0;
    return (queueStats.completed / queueStats.total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Queue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats?.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats?.processing_rate || 0}</p>
                <p className="text-xs text-muted-foreground">Files/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Queue Processing Control</span>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isProcessing ? 'default' : 'outline'}
                className="gap-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                    Processing
                  </>
                ) : (
                  'Idle'
                )}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{queueStats?.completed || 0} completed</span>
              <span>ETA: {formatTime(queueStats?.estimated_time || 0)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="ml-2 w-20 px-2 py-1 text-sm border rounded"
                  min="100"
                  max="5000"
                  step="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Concurrent Jobs</label>
                <input
                  type="number"
                  value={concurrentJobs}
                  onChange={(e) => setConcurrentJobs(Number(e.target.value))}
                  className="ml-2 w-16 px-2 py-1 text-sm border rounded"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => startProcessing.mutate()}
                disabled={isProcessing || startProcessing.isPending}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
              
              <Button
                variant="outline"
                onClick={() => pauseProcessing.mutate('pause')}
                disabled={!isProcessing}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => stopProcessing.mutate()}
                disabled={!isProcessing}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => retryFailed.mutate()}
                disabled={!queueStats?.failed}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Status */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches?.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{batch.batch_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {batch.total_files} files • Created {new Date(batch.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge {...getStatusBadge(batch.processing_status)}>
                    {batch.processing_status}
                  </Badge>
                  {batch.completed_at && (
                    <span className="text-xs text-muted-foreground">
                      Completed {new Date(batch.completed_at).toLocaleTimeString()}
                    </span>
                  )}
                  {batch.error_log && (
                    <div title="Has errors">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(!batches || batches.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No processing batches found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};