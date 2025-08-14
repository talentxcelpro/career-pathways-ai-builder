import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Play, Pause, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EmailQueueStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
  successRate: number;
}

interface EmailQueueItem {
  id: string;
  trigger_type: string;
  recipient_email: string;
  recipient_name: string;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message: string;
  created_at: string;
  scheduled_at: string;
  sent_at: string;
}

export const EmailQueueMonitor = () => {
  const [stats, setStats] = useState<EmailQueueStats>({
    pending: 0,
    sent: 0,
    failed: 0,
    total: 0,
    successRate: 0
  });
  const [queueItems, setQueueItems] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailQueueItem | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const safeData = (data as any) || [];
      const stats = safeData.reduce((acc: any, item: any) => {
        if (item && typeof item === 'object' && item.status) {
          acc[item.status] = (acc[item.status] || 0) + 1;
        }
        acc.total++;
        return acc;
      }, { pending: 0, sent: 0, failed: 0, total: 0 } as any);

      stats.successRate = stats.total > 0 ? ((stats.sent / stats.total) * 100) : 0;
      
      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email queue statistics",
        variant: "destructive"
      });
    }
  };

  const fetchQueueItems = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQueueItems((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching queue items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email queue items",
        variant: "destructive"
      });
    }
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Processed ${data.processed || 0} emails successfully`,
      });

      // Refresh data
      await Promise.all([fetchStats(), fetchQueueItems()]);
    } catch (error: any) {
      console.error('Error processing queue:', error);
      toast({
        title: "Error",
        description: "Failed to process email queue",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const clearFailedEmails = async () => {
    try {
      const { error } = await supabase
        .from('email_automation_queue')
        .delete()
        .eq('status', 'failed' as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Failed emails cleared successfully",
      });

      await Promise.all([fetchStats(), fetchQueueItems()]);
    } catch (error: any) {
      console.error('Error clearing failed emails:', error);
      toast({
        title: "Error",
        description: "Failed to clear failed emails",
        variant: "destructive"
      });
    }
  };

  const retryFailedEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('email_automation_queue')
        .update({ 
          status: 'pending', 
          attempts: 0, 
          error_message: null,
          scheduled_at: new Date().toISOString()
        } as any)
        .eq('id', emailId as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email queued for retry",
      });

      await Promise.all([fetchStats(), fetchQueueItems()]);
    } catch (error: any) {
      console.error('Error retrying email:', error);
      toast({
        title: "Error",
        description: "Failed to retry email",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchQueueItems()]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={processQueue} 
          disabled={processing}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {processing ? 'Processing...' : 'Process Queue'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => Promise.all([fetchStats(), fetchQueueItems()])}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>

        {stats.failed > 0 && (
          <Button 
            variant="destructive" 
            onClick={clearFailedEmails}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Failed ({stats.failed})
          </Button>
        )}
      </div>

      {/* Queue Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Recipient</th>
                  <th className="text-left p-2">Attempts</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{getStatusBadge(item.status)}</td>
                    <td className="p-2 font-medium">{item.trigger_type}</td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{item.recipient_name}</div>
                        <div className="text-sm text-muted-foreground">{item.recipient_email}</div>
                      </div>
                    </td>
                    <td className="p-2">{item.attempts}/{item.max_attempts}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedEmail(item)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Email Details</DialogTitle>
                            </DialogHeader>
                            {selectedEmail && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div>{getStatusBadge(selectedEmail.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <div>{selectedEmail.trigger_type}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Recipient</label>
                                    <div>{selectedEmail.recipient_email}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Attempts</label>
                                    <div>{selectedEmail.attempts}/{selectedEmail.max_attempts}</div>
                                  </div>
                                </div>
                                {selectedEmail.error_message && (
                                  <div>
                                    <label className="text-sm font-medium text-red-600">Error Message</label>
                                    <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
                                      {selectedEmail.error_message}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {item.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => retryFailedEmail(item.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};