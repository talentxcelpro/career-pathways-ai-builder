import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Eye, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ImportBatch {
  id: string;
  batch_name: string;
  status: string;
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  created_at: string;
  completed_at: string | null;
  error_log: any;
}

export function ImportBatchMonitor() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('import-batches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'import_batches' },
        () => {
          fetchBatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBatches(data || []);
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'default', label: 'Processing' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      partial: { variant: 'secondary', label: 'Partial' }
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = (batch: ImportBatch) => {
    if (batch.total_records === 0) return 0;
    return (batch.processed_records / batch.total_records) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading batches...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Import Batches</h2>
        <Button variant="outline" size="sm" onClick={fetchBatches}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No import batches found</p>
            </CardContent>
          </Card>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{batch.batch_name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge(batch.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                {batch.status === 'processing' && (
                  <div className="space-y-2">
                    <Progress value={calculateProgress(batch)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{batch.processed_records} / {batch.total_records} processed</span>
                      <span>{calculateProgress(batch).toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{batch.total_records}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Processed</p>
                    <p className="text-lg font-semibold">{batch.processed_records}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success</p>
                    <p className="text-lg font-semibold text-green-600">{batch.success_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Errors</p>
                    <p className="text-lg font-semibold text-red-600">{batch.error_count}</p>
                  </div>
                </div>

                {/* Error Log Preview */}
                {batch.error_count > 0 && batch.error_log && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-destructive mb-1">Recent Errors:</p>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-20">
                      {JSON.stringify(batch.error_log, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Errors
                  </Button>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
