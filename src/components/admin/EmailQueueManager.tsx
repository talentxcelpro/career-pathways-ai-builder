import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Play, Clock, CheckCircle, XCircle, Mail } from 'lucide-react';

interface QueuedEmail {
  id: string;
  to_email: string;
  subject: string;
  template_name: string;
  status: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
}

interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export function EmailQueueManager() {
  const [emails, setEmails] = useState<QueuedEmail[]>([]);
  const [stats, setStats] = useState<QueueStats>({ pending: 0, sent: 0, failed: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchQueueData = async () => {
    setIsLoading(true);
    try {
      // Fetch recent emails
      const { data: emailData, error: emailError } = await supabase
        .from('email_queue_simple')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (emailError) {
        console.error('Error fetching emails:', emailError);
        toast.error('Failed to fetch email queue data');
        return;
      }

      setEmails(emailData || []);

      // Calculate stats
      const pending = emailData?.filter(e => e.status === 'pending').length || 0;
      const sent = emailData?.filter(e => e.status === 'sent').length || 0;
      const failed = emailData?.filter(e => e.status === 'failed').length || 0;
      const total = emailData?.length || 0;

      setStats({ pending, sent, failed, total });

    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to fetch email queue data');
    } finally {
      setIsLoading(false);
    }
  };

  const processQueue = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { manual: true }
      });

      if (error) {
        console.error('Error processing queue:', error);
        toast.error('Failed to process email queue');
        return;
      }

      const result = data;
      if (result?.success) {
        toast.success(`Queue processed: ${result.stats.sent} sent, ${result.stats.failed} failed`);
        await fetchQueueData(); // Refresh the data
      } else {
        toast.error(result?.error || 'Failed to process queue');
      }

    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Failed to process email queue');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'sent':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Queue Manager</h2>
          <p className="text-muted-foreground">Monitor and manage the email delivery queue</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchQueueData}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={processQueue}
            disabled={isProcessing}
          >
            <Play className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Process Queue
          </Button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>
            Shows the last 50 emails in the queue. The system automatically processes pending emails every 5 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.to_email}</TableCell>
                  <TableCell className="max-w-xs truncate" title={email.subject}>
                    {email.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{email.template_name}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(email.status)}</TableCell>
                  <TableCell>
                    {email.retry_count}/{email.max_retries}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(email.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {email.sent_at ? formatDate(email.sent_at) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {emails.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No emails in queue
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Status</CardTitle>
          <CardDescription>Email queue processing automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Automated processing: Every 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Retry logic: Up to 3 attempts per email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Fallback system: Database queue when edge function fails</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}