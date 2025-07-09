import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Play, Clock, CheckCircle, XCircle, Mail, Activity, Globe } from 'lucide-react';

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
    
    console.log('=== Email Queue Processing Debug ===');
    console.log('Starting manual queue processing...');
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Test basic connectivity first
      console.log('Testing Supabase client connectivity...');
      
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { manual: true }
      });

      console.log('Supabase function invoke response:');
      console.log('- data:', data);
      console.log('- error:', error);

      if (error) {
        console.error('=== Supabase Function Error ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error context:', error.context);
        console.error('Error details:', error.details);
        
        // More specific error messages
        let errorMessage = 'Failed to process email queue';
        if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error: Cannot reach email processing service. Check your internet connection.';
        } else if (error.message?.includes('fetch')) {
          errorMessage = 'Connection error: Unable to connect to email service.';
        } else if (error.message?.includes('CORS')) {
          errorMessage = 'CORS error: Cross-origin request blocked.';
        } else if (error.message) {
          errorMessage = `Service error: ${error.message}`;
        }
        
        toast.error(errorMessage);
        return;
      }

      const result = data;
      console.log('Processing result:', result);
      
      if (result?.success) {
        const message = `Queue processed successfully! ${result.stats.sent} sent, ${result.stats.failed} failed`;
        console.log('Success:', message);
        toast.success(message);
        await fetchQueueData(); // Refresh the data
      } else {
        const errorMsg = result?.error || 'Unknown error occurred during processing';
        console.error('Processing failed:', errorMsg);
        toast.error(`Processing failed: ${errorMsg}`);
      }

    } catch (error) {
      console.error('=== Unexpected Error ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      
      // Determine error type for better user feedback
      let userMessage = 'Failed to process email queue';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        userMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error?.message?.includes('NetworkError')) {
        userMessage = 'Network error occurred. The service may be temporarily unavailable.';
      } else if (error?.message) {
        userMessage = `Error: ${error.message}`;
      }
      
      toast.error(userMessage);
    } finally {
      console.log('Processing attempt completed');
      setIsProcessing(false);
    }
  };

  const testConnectivity = async () => {
    console.log('=== Starting Connectivity Tests ===');
    
    try {
      // Test 1: Health check function
      console.log('Test 1: Health check function...');
      const { data: healthData, error: healthError } = await supabase.functions.invoke('health-check');
      
      console.log('Health check response:', { healthData, healthError });
      
      if (healthError) {
        console.error('Health check failed:', healthError);
        toast.error(`Health check failed: ${healthError.message}`);
      } else {
        console.log('Health check successful:', healthData);
        toast.success('Health check successful!');
      }
      
      // Test 2: Process email queue function
      console.log('Test 2: Process email queue function...');
      const { data: queueData, error: queueError } = await supabase.functions.invoke('process-email-queue', {
        body: { test: true }
      });
      
      console.log('Queue function response:', { queueData, queueError });
      
      if (queueError) {
        console.error('Queue function test failed:', queueError);
        toast.error(`Queue function test failed: ${queueError.message}`);
      } else {
        console.log('Queue function test successful:', queueData);
        toast.success('Queue function test successful!');
      }
      
    } catch (err) {
      console.error('Connectivity test exception:', err);
      toast.error(`Connectivity test failed: ${err.message}`);
    }
  };

  const testDirectUrl = async () => {
    console.log('=== Testing Direct Function URLs ===');
    
    const baseUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1`;
    
    try {
      // Test health check endpoint
      console.log('Testing health check URL...');
      const healthUrl = `${baseUrl}/health-check`;
      console.log('Health check URL:', healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health check response status:', healthResponse.status);
      console.log('Health check response headers:', Object.fromEntries(healthResponse.headers.entries()));
      
      if (healthResponse.ok) {
        const healthResult = await healthResponse.json();
        console.log('Health check result:', healthResult);
        toast.success('Direct health check successful!');
      } else {
        const errorText = await healthResponse.text();
        console.error('Health check failed:', errorText);
        toast.error(`Direct health check failed: ${healthResponse.status} ${errorText}`);
      }
      
    } catch (err) {
      console.error('Direct URL test failed:', err);
      toast.error(`Direct URL test failed: ${err.message}`);
      
      // Additional debugging
      console.log('Network Error Details:');
      console.log('- Error name:', err.name);
      console.log('- Error message:', err.message);
      console.log('- Error stack:', err.stack);
      
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        console.log('This appears to be a network connectivity issue');
        console.log('Possible causes:');
        console.log('1. Function not deployed');
        console.log('2. Network blocking requests');
        console.log('3. CORS issues');
        console.log('4. Browser security restrictions');
      }
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
        <div className="flex gap-2 flex-wrap">
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
          <Button
            onClick={testConnectivity}
            variant="outline"
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button
            onClick={testDirectUrl}
            variant="secondary"
            size="sm"
          >
            <Globe className="w-4 h-4 mr-2" />
            Test Direct URL
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