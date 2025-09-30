import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QueueMonitor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queueItems, isLoading } = useQuery({
    queryKey: ['email-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-email-queue');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-queue'] });
      toast({
        title: 'Queue processed',
        description: 'Email queue processing triggered successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to process email queue',
        variant: 'destructive',
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const statusCounts = {
    pending: queueItems?.filter(i => i.status === 'pending').length || 0,
    sent: queueItems?.filter(i => i.status === 'sent').length || 0,
    failed: queueItems?.filter(i => i.status === 'failed').length || 0,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Queue (Last 50)</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['email-queue'] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm"
                onClick={() => processQueueMutation.mutate()}
                disabled={processQueueMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Process Queue
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueItems?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{item.recipient_email}</p>
                    <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                    <Badge variant="outline">{item.trigger_type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Created: {new Date(item.created_at).toLocaleString()}</span>
                    {item.scheduled_at && (
                      <span>Scheduled: {new Date(item.scheduled_at).toLocaleString()}</span>
                    )}
                    {item.sent_at && (
                      <span>Sent: {new Date(item.sent_at).toLocaleString()}</span>
                    )}
                  </div>
                  {item.error_message && (
                    <p className="text-sm text-destructive">{item.error_message}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Attempt {item.retry_count || 0}
                </div>
              </div>
            ))}

            {queueItems?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No emails in queue
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
