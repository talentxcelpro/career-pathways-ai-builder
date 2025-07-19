import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Settings, 
  TestTube, 
  Calendar,
  Users,
  UserPlus,
  Briefcase,
  Bell,
  Shield,
  BarChart,
  Lock,
  SendHorizontal,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Zap,
  Clock,
  AlertCircle,
  Eye,
  MousePointer,
  TrendingUp
} from 'lucide-react';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import components with error handling
let EmailTriggerSettingsModal: React.ComponentType<any> | null = null;
let BulkEmailProcessor: React.ComponentType<any> | null = null;
let EmailAnalyticsDashboard: React.ComponentType<any> | null = null;
let RealTimeEmailAnalytics: React.ComponentType<any> | null = null;

try {
  const EmailTriggerSettingsModalModule = require('./EmailTriggerSettingsModal');
  EmailTriggerSettingsModal = EmailTriggerSettingsModalModule.EmailTriggerSettingsModal;
} catch (e) {
  console.error('Failed to load EmailTriggerSettingsModal:', e);
}

try {
  const BulkEmailProcessorModule = require('./BulkEmailProcessor');
  BulkEmailProcessor = BulkEmailProcessorModule.BulkEmailProcessor;
} catch (e) {
  console.error('Failed to load BulkEmailProcessor:', e);
}

try {
  const EmailAnalyticsDashboardModule = require('./EmailAnalyticsDashboard');
  EmailAnalyticsDashboard = EmailAnalyticsDashboardModule.EmailAnalyticsDashboard;
} catch (e) {
  console.error('Failed to load EmailAnalyticsDashboard:', e);
}

try {
  const RealTimeEmailAnalyticsModule = require('./RealTimeEmailAnalytics');
  RealTimeEmailAnalytics = RealTimeEmailAnalyticsModule.RealTimeEmailAnalytics;
} catch (e) {
  console.error('Failed to load RealTimeEmailAnalytics:', e);
}

interface EmailTrigger {
  id: string;
  trigger_type: string;
  is_enabled: boolean;
  template_name: string;
  subject_template: string;
  delay_minutes: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface EmailStats {
  pending: number;
  sent: number;
  failed: number;
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export const EmailAutomationManager = () => {
  const { triggerWelcomeEmail, triggerConnectionEmail, triggerJobRecommendationEmail } = useEmailAutomation();
  const [testEmail, setTestEmail] = useState('');
  const [triggers, setTriggers] = useState<EmailTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkEmailSending, setBulkEmailSending] = useState(false);
  const [bulkEmailProgress, setBulkEmailProgress] = useState({ sent: 0, total: 0 });
  const [emailQueue, setEmailQueue] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<EmailTrigger | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [stats, setStats] = useState<EmailStats>({
    pending: 0,
    sent: 0,
    failed: 0,
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
  });

  const processEmailQueue = async () => {
    try {
      setIsProcessing(true);
      
      console.log('Calling process-email-queue function...');
      
      // First, do a quick health check
      try {
        const { error: healthError } = await supabase
          .from('email_automation_queue')
          .select('id')
          .limit(1);
        
        if (healthError) {
          toast.error('Database connection failed. Please check your connection.');
          return;
        }
      } catch (healthErr) {
        toast.error('Unable to connect to database. Please try again.');
        return;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );

      const requestPromise = supabase.functions.invoke('smart-email-processor', {
        body: { manual: true }
      });

      const { data, error } = await Promise.race([requestPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Supabase function error:', error);
        toast.error(`Failed to process email queue: ${error.message}`);
        return;
      }
      
      console.log('Email queue processing result:', data);
      
      if (data?.error) {
        console.error('Function returned error:', data.error);
        toast.error(`Queue processing failed: ${data.error}`);
        return;
      }
      
      const processed = data?.processed || 0;
      const failed = data?.failed || 0;
      const retrying = data?.retrying || 0;
      
      let message = 'Email queue processed successfully';
      if (processed > 0) {
        message = `✅ Processed ${processed} emails`;
        if (retrying > 0) message += `, ${retrying} retrying`;
        if (failed > 0) message += `, ${failed} failed`;
      } else {
        message = 'No emails to process';
      }
      
      if (failed > 0) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
      
      // Refresh stats and queue after processing
      await Promise.all([fetchStats(), showQueue && fetchEmailQueue()]);
    } catch (error: any) {
      console.error('Network/Function error:', error);
      const errorMessage = error.message || 'Unknown error';
      
      // Provide more specific error messages with actionable solutions
      if (errorMessage.includes('timeout')) {
        toast.error('Email processing timed out. Try the "Bulk Email Processing" section below for better handling of large queues.');
      } else if (errorMessage.includes('Failed to send a request to the Edge Function')) {
        toast.error('Edge function is unavailable. Use "Test Single Email" or "Database Fallback" in the Bulk Processing section.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Check your connection and try again, or use the Bulk Processing fallback options.');
      } else {
        toast.error(`Failed to process email queue: ${errorMessage}. Try the Bulk Processing section for alternative options.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch real email statistics from database
  const fetchStats = async () => {
    try {
      // Get queue statistics
      const { data: queueData } = await supabase
        .from('email_automation_queue')
        .select('status, recipient_email')
        .order('created_at', { ascending: false });
      
      // Get delivery events for real analytics
      const { data: eventsData } = await supabase
        .from('email_delivery_events')
        .select('event_type, recipient_email, email_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (queueData) {
        const pending = queueData.filter(q => q.status === 'pending').length;
        const sent = queueData.filter(q => q.status === 'sent').length;
        const failed = queueData.filter(q => q.status === 'failed').length;
        
        // Calculate real delivery and engagement stats from events
        const eventCounts = eventsData?.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        // Count unique users for each engagement type
        const uniqueRecipients = {
          delivered: new Set<string>(),
          opened: new Set<string>(),
          clicked: new Set<string>(),
          bounced: new Set<string>()
        };
        
        eventsData?.forEach(event => {
          const email = event.recipient_email || event.email_id;
          if (email && event.event_type in uniqueRecipients) {
            uniqueRecipients[event.event_type as keyof typeof uniqueRecipients].add(email);
          }
        });
        
        // Use real data instead of fake statistics
        setStats({
          pending,
          sent,
          failed,
          totalSent: sent, // Use actual sent count from queue
          delivered: Math.max(uniqueRecipients.delivered.size, sent), // At minimum, all sent emails are delivered
          opened: uniqueRecipients.opened.size,
          clicked: uniqueRecipients.clicked.size,
          bounced: uniqueRecipients.bounced.size,
        });
        
        console.log('Real email stats calculated:', {
          pending,
          sent,
          failed,
          totalSent: sent,
          delivered: Math.max(uniqueRecipients.delivered.size, sent),
          opened: uniqueRecipients.opened.size,
          clicked: uniqueRecipients.clicked.size,
          bounced: uniqueRecipients.bounced.size,
          eventCounts
        });
      }
    } catch (error) {
      console.error('Error fetching real email stats:', error);
    }
  };

  const triggerConfigs = {
    welcome_email: { name: 'Welcome Email', description: 'Sent when a new user signs up', icon: UserPlus, color: 'text-green-600' },
    connection_request: { name: 'Connection Request', description: 'Sent when someone sends a connection request', icon: Users, color: 'text-blue-600' },
    job_recommendation: { name: 'Job Recommendations', description: 'Sent when new matching jobs are found', icon: Briefcase, color: 'text-purple-600' },
    application_confirmation: { name: 'Application Confirmation', description: 'Sent when user applies for a job', icon: Send, color: 'text-orange-600' },
    team_invitation: { name: 'Team Invitation', description: 'Sent when user is invited to join a team', icon: Mail, color: 'text-indigo-600' },
    password_reset: { name: 'Password Reset', description: 'Sent when user requests password reset', icon: Lock, color: 'text-red-600' },
    interview_scheduled: { name: 'Interview Scheduled', description: 'Sent when an interview is scheduled', icon: Calendar, color: 'text-teal-600' },
    monthly_digest: { name: 'Monthly Digest', description: 'Monthly summary of user activity', icon: BarChart, color: 'text-yellow-600' }
  };

  useEffect(() => {
    fetchEmailTriggers();
    fetchStats();
  }, []);

  const fetchEmailTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_settings')
        .select('*')
        .order('trigger_type');

      if (error) throw error;

      const formattedTriggers = data.map(trigger => ({
        ...trigger,
        ...triggerConfigs[trigger.trigger_type as keyof typeof triggerConfigs],
        id: trigger.id
      }));

      setTriggers(formattedTriggers);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      toast.error('Failed to load email automation settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = async (triggerId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automation_settings')
        .update({ is_enabled: !currentEnabled })
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, is_enabled: !currentEnabled }
          : trigger
      ));

      toast.success(`Email trigger ${!currentEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling trigger:', error);
      toast.error('Failed to update email trigger');
    }
  };

  const testEmailTemplate = async (triggerType: string) => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      const testData = getTestData(triggerType);
      
      const { error } = await supabase.rpc('queue_automated_email', {
        p_trigger_type: triggerType,
        p_recipient_email: testEmail,
        p_recipient_name: 'Test User',
        p_template_data: testData
      });

      if (error) throw error;

      toast.success(`Test email queued successfully to ${testEmail}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to queue test email');
    }
  };

  const getTestData = (triggerType: string) => {
    const sampleData = {
      welcome_email: { name: 'Test User', user_id: 'test-123' },
      connection_request: { 
        recipient_name: 'Test User', 
        requester_name: 'John Doe', 
        requester_title: 'Software Engineer',
        requester_company: 'TechCorp'
      },
      job_recommendation: {
        name: 'Test User',
        job_title: 'Senior Developer',
        company_name: 'Amazing Company',
        location: 'Remote',
        salary_range: '$80k - $120k',
        job_id: 'test-job-123',
        requirements: ['React experience', 'TypeScript knowledge', 'Team collaboration']
      },
      application_confirmation: {
        name: 'Test User',
        job_title: 'Frontend Developer',
        company_name: 'Great Startup',
        application_id: 'APP-TEST-123',
        applied_date: new Date().toISOString()
      },
      team_invitation: {
        invited_name: 'Test User',
        inviter_name: 'Jane Smith',
        company_name: 'Awesome Corp',
        role: 'Developer',
        invite_token: 'test-token-123'
      },
      password_reset: {
        name: 'Test User',
        reset_link: 'https://talentxcel.in/reset?token=test-123',
        ip_address: '192.168.1.1'
      },
      interview_scheduled: {
        candidate_name: 'Test User',
        company_name: 'Dream Company',
        job_title: 'Senior Engineer',
        interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        interview_time: '2:00 PM',
        interview_type: 'Virtual',
        meeting_link: 'https://meet.google.com/test-123'
      },
      monthly_digest: {
        name: 'Test User',
        profile_views: 45,
        applications_sent: 12,
        new_connections: 8,
        interviews: 3,
        trending_jobs: [
          { title: 'React Developer', company: 'TechCorp', location: 'Remote', salary: '$90k - $130k' },
          { title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'San Francisco', salary: '$100k - $150k' }
        ]
      }
    };

    return sampleData[triggerType as keyof typeof sampleData] || {};
  };

  const handleSettingsClick = (trigger: EmailTrigger) => {
    setSelectedTrigger(trigger);
    setIsSettingsModalOpen(true);
  };

  const handleSettingsSave = (updatedTrigger: EmailTrigger) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === updatedTrigger.id ? updatedTrigger : trigger
    ));
    setIsSettingsModalOpen(false);
    setSelectedTrigger(null);
  };

  const fetchEmailQueue = async () => {
    setQueueLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEmailQueue(data || []);
    } catch (error) {
      console.error('Error fetching email queue:', error);
      toast.error('Failed to load email queue');
    } finally {
      setQueueLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
      pending: 'secondary',
      processing: 'default',
      sent: 'default',
      failed: 'destructive',
      error: 'destructive'
    };
    
    const colors = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600', 
      sent: 'text-green-600',
      failed: 'text-red-600',
      error: 'text-red-600'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        <span className={colors[status as keyof typeof colors] || 'text-gray-600'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Automation</h1>
          <p className="text-muted-foreground">
            Configure and monitor automated email campaigns and delivery reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={processEmailQueue} 
            disabled={isProcessing}
            variant="outline"
          >
            <Send className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Process Queue'}
          </Button>
          <Button onClick={fetchStats} variant="outline">
            <BarChart className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* API Configuration Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Zap className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Unified Email System Active:</strong> Configure both RESEND_API_KEY and SENDGRID_API_KEY for maximum reliability with automatic fallback.
          <div className="mt-2 flex flex-wrap gap-4">
            <a 
              href="https://resend.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Get Resend API Key <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://app.sendgrid.com/settings/api_keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Get SendGrid API Key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      {/* Email Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Send className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Opened</p>
                <p className="text-2xl font-bold">{stats.opened}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Triggers Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Email Triggers</CardTitle>
          <CardDescription>
            Configure automated email templates and their triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {triggers.map((trigger) => {
                const IconComponent = trigger.icon;
                return (
                  <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <IconComponent className={`h-6 w-6 ${trigger.color}`} />
                      <div>
                        <h3 className="font-medium">{trigger.name}</h3>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={trigger.is_enabled ? "default" : "secondary"}>
                        {trigger.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`trigger-${trigger.id}`} className="text-sm">
                          Active
                        </Label>
                        <Switch
                          id={`trigger-${trigger.id}`}
                          checked={trigger.is_enabled}
                          onCheckedChange={() => toggleTrigger(trigger.id, trigger.is_enabled)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettingsClick(trigger)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testEmailTemplate(trigger.trigger_type)}
                      >
                        <TestTube className="w-4 h-4" />
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Templates</CardTitle>
          <CardDescription>
            Send test emails to verify your email templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter test email address..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => toast.success('Use the Test button next to each trigger above!')}>
              <Mail className="w-4 h-4 mr-2" />
              Instructions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Queue Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Queue</CardTitle>
              <CardDescription>
                Monitor and manage the email queue
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowQueue(!showQueue);
                  if (!showQueue) fetchEmailQueue();
                }}
                variant="outline"
                size="sm"
              >
                {showQueue ? 'Hide Queue' : 'Show Queue'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showQueue && (
          <CardContent>
            {queueLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {emailQueue.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No emails in queue</p>
                ) : (
                  emailQueue.slice(0, 10).map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{email.recipient_email}</p>
                        <p className="text-sm text-gray-600">{email.trigger_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(email.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Real-Time Analytics Section */}
      {RealTimeEmailAnalytics && <RealTimeEmailAnalytics />}
      
      {/* Analytics Dashboard */}
      {EmailAnalyticsDashboard && <EmailAnalyticsDashboard />}

      {/* Bulk Email Processor */}
      {BulkEmailProcessor && <BulkEmailProcessor onStatsUpdate={fetchStats} />}

      {/* Settings Modal */}
      {EmailTriggerSettingsModal && (
        <EmailTriggerSettingsModal
          trigger={selectedTrigger}
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            setSelectedTrigger(null);
          }}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
};