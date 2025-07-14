import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search,
  Filter
} from 'lucide-react';

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  template: string;
  data: any;
  status: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export const EmailManagementPanel: React.FC = () => {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to fetch email queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('email_queue_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'email_queue' },
        () => fetchEmails()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const retryEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('email_queue')
        .update({ 
          status: 'pending', 
          retry_count: 0,
          error_message: null
        })
        .eq('id', emailId);

      if (error) throw error;
      
      toast.success('Email queued for retry');
      await fetchEmails();
    } catch (error) {
      console.error('Error retrying email:', error);
      toast.error('Failed to retry email');
    }
  };

  const retryAllFailed = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('email_queue')
        .update({ 
          status: 'pending', 
          retry_count: 0,
          error_message: null
        })
        .eq('status', 'failed');

      if (error) throw error;
      
      toast.success('All failed emails queued for retry');
      await fetchEmails();
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      toast.error('Failed to retry failed emails');
    } finally {
      setIsProcessing(false);
    }
  };

  const processEmailQueue = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-email-queue');
      
      if (error) throw error;
      
      toast.success('Email queue processing started');
      await fetchEmails();
    } catch (error) {
      console.error('Error processing email queue:', error);
      toast.error('Failed to process email queue');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.to_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700'}>
        {status}
      </Badge>
    );
  };

  const stats = {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Queue Management
            </span>
            <div className="flex gap-2">
              <Button
                onClick={processEmailQueue}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Process Queue'}
              </Button>
              {stats.failed > 0 && (
                <Button
                  onClick={retryAllFailed}
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry All Failed
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No emails found matching your criteria
              </div>
            ) : (
              filteredEmails.map((email) => (
                <Card key={email.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(email.status)}
                          <span className="font-medium">{email.subject}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>To: {email.to_email}</div>
                          <div>Template: {email.template}</div>
                          <div>Created: {new Date(email.created_at).toLocaleString()}</div>
                          {email.sent_at && (
                            <div>Sent: {new Date(email.sent_at).toLocaleString()}</div>
                          )}
                          {email.retry_count > 0 && (
                            <div>Retries: {email.retry_count}/{email.max_retries}</div>
                          )}
                          {email.error_message && (
                            <div className="text-red-600">Error: {email.error_message}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {email.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryEmail(email.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};