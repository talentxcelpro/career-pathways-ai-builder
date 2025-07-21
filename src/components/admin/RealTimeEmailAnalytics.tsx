
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, XCircle, Pause, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailQueueItem {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  trigger_type: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
  attempts: number;
}

const getTriggerSubject = (triggerType: string): string => {
  const subjects: Record<string, string> = {
    'welcome_email': 'Welcome to TalentXcel',
    'user_registration': 'Welcome to TalentXcel',
    'job_application': 'Job Application Received',
    'employer_approval': 'Employer Account Approved',
    'profile_reminder': 'Complete Your Profile',
    'job_match': 'New Job Match Found',
    'password_reset': 'Password Reset Request',
    'interview_scheduled': 'Interview Scheduled'
  };
  return subjects[triggerType] || 'Email Notification';
};

export const RealTimeEmailAnalytics: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmailQueue = async () => {
    try {
      // Fetch from both email queue tables
      const [automationResponse, simpleResponse] = await Promise.all([
        supabase
          .from('email_automation_queue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('email_queue_simple')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15)
      ]);

      const combinedEmails: EmailQueueItem[] = [];

      // Process automation queue emails
      if (automationResponse.data) {
        const automationEmails: EmailQueueItem[] = automationResponse.data.map(item => ({
          id: item.id,
          recipient_email: item.recipient_email,
          recipient_name: item.recipient_name,
          trigger_type: item.trigger_type,
          status: item.status as 'pending' | 'processing' | 'sent' | 'failed',
          created_at: item.created_at,
          sent_at: item.sent_at,
          error_message: item.error_message,
          attempts: item.attempts || 0
        }));
        combinedEmails.push(...automationEmails);
      }

      // Process simple queue emails
      if (simpleResponse.data) {
        const simpleEmails: EmailQueueItem[] = simpleResponse.data.map(item => ({
          id: item.id,
          recipient_email: item.to_email,
          recipient_name: undefined,
          trigger_type: item.template_name || 'manual',
          status: item.status as 'pending' | 'processing' | 'sent' | 'failed',
          created_at: item.created_at,
          sent_at: item.sent_at,
          error_message: item.error_message,
          attempts: item.retry_count || 0
        }));
        combinedEmails.push(...simpleEmails);
      }

      // Sort combined results by creation date
      combinedEmails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setEmailQueue(combinedEmails.slice(0, 20)); // Show top 20 results

      if (automationResponse.error || simpleResponse.error) {
        console.error('Error fetching email queues:', { 
          automationError: automationResponse.error, 
          simpleError: simpleResponse.error 
        });
        toast.error('Failed to fetch some email queue data');
      }

    } catch (error) {
      console.error('Error in fetchEmailQueue:', error);
      toast.error('Failed to load email queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailQueue();
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('email-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_automation_queue'
        },
        (payload) => {
          console.log('Real-time email queue update:', payload);
          fetchEmailQueue(); // Refresh the queue when changes occur
        }
      )
      .subscribe();

    // Also refresh every 30 seconds as a fallback
    const interval = setInterval(() => {
      fetchEmailQueue();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isMonitoring]);

  const getStatusIcon = (status: EmailQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 animate-spin text-blue-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: EmailQueueItem['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      sent: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchEmailQueue();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getDisplayName = (email: string, name?: string) => {
    if (name) return name;
    // Extract name from email (before @)
    return email.split('@')[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Email Queue
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : emailQueue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No emails in queue
            </p>
          ) : (
            emailQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">
                      {getDisplayName(item.recipient_email, item.recipient_name)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({item.recipient_email})
                    </span>
                    {getStatusBadge(item.status)}
                    {item.attempts > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Attempt {item.attempts}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {getTriggerSubject(item.trigger_type)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {formatTimestamp(item.created_at)}</span>
                    {item.sent_at && (
                      <span>Sent: {formatTimestamp(item.sent_at)}</span>
                    )}
                  </div>
                  {item.error_message && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {item.error_message}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
