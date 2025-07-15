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
import { EmailTriggerSettingsModal } from './EmailTriggerSettingsModal';
import { BulkEmailProcessor } from './BulkEmailProcessor';

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

      const requestPromise = supabase.functions.invoke('process-email-queue', {
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

  // Fetch email statistics
  const fetchStats = async () => {
    try {
      // Get queue statistics
      const { data: queueData } = await supabase
        .from('email_automation_queue')
        .select('status')
        .order('created_at', { ascending: false });
      
      // Get delivery events for real analytics
      const { data: eventsData } = await supabase
        .from('email_delivery_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      // Get daily analytics
      const { data: dailyData } = await supabase
        .from('email_analytics_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      
      if (queueData) {
        const pending = queueData.filter(q => q.status === 'pending').length;
        const sent = queueData.filter(q => q.status === 'sent').length;
        const failed = queueData.filter(q => q.status === 'failed').length;
        
        // Calculate real delivery stats from events
        const eventCounts = eventsData?.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        // Calculate totals from daily analytics
        const totals = dailyData?.reduce((acc, day) => ({
          sent: acc.sent + (day.emails_sent || 0),
          delivered: acc.delivered + (day.emails_delivered || 0),
          opened: acc.opened + (day.emails_opened || 0),
          clicked: acc.clicked + (day.emails_clicked || 0),
          bounced: acc.bounced + (day.emails_bounced || 0),
          failed: acc.failed + (day.emails_failed || 0),
        }), { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }) || { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 };
        
        setStats({
          pending,
          sent,
          failed,
          totalSent: totals.sent || sent,
          delivered: totals.delivered || eventCounts['delivered'] || 0,
          opened: totals.opened || eventCounts['opened'] || 0,
          clicked: totals.clicked || eventCounts['clicked'] || 0,
          bounced: totals.bounced || eventCounts['bounced'] || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <Alert className="border-yellow-200 bg-yellow-50">
        <Zap className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Email Service Setup Required:</strong> To send emails, configure either RESEND_API_KEY or SENDGRID_API_KEY in your Supabase Edge Functions secrets.
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
            <a 
              href={`https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/functions`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Configure in Supabase <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      {/* Email Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalSent > 0 ? Math.round((stats.delivered / stats.totalSent) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalSent > 0 ? Math.round((stats.delivered / stats.totalSent) * 100) : 0}% delivery rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Opened</p>
              <p className="text-2xl font-bold">{stats.opened}</p>
              <p className="text-xs text-muted-foreground">
                {stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0}% open rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MousePointer className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Clicked</p>
              <p className="text-2xl font-bold">{stats.clicked}</p>
              <p className="text-xs text-muted-foreground">
                {stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0}% click rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automated emails for various user actions and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <TestTube className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter email to test templates"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Triggers</CardTitle>
          <CardDescription>
            Enable or disable automated email triggers for different events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 text-center py-8">Loading email triggers...</div>
            ) : (
              triggers.map((trigger) => (
                <div key={trigger.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <trigger.icon className={`h-5 w-5 ${trigger.color}`} />
                      <div>
                        <h3 className="font-semibold">{trigger.name}</h3>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={trigger.is_enabled ? "default" : "secondary"}>
                        {trigger.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={trigger.is_enabled}
                        onCheckedChange={() => toggleTrigger(trigger.id, trigger.is_enabled)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testEmailTemplate(trigger.trigger_type)}
                      disabled={isProcessing || !testEmail}
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Template
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSettingsClick(trigger)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Queue
              </CardTitle>
              <CardDescription>
                Automatic processing runs every 2 minutes. View pending and processed emails.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                Auto Processing Active
              </Badge>
              <Button
                onClick={() => {
                  setShowQueue(!showQueue);
                  if (!showQueue) fetchEmailQueue();
                }}
                variant="outline"
              >
                {showQueue ? 'Hide Queue' : 'View Queue'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showQueue && (
          <CardContent>
            {queueLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading email queue...
              </div>
            ) : emailQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emails in queue
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {emailQueue.length} recent emails
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchEmailQueue}
                    disabled={queueLoading}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {emailQueue.map((email) => (
                      <div key={email.id} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {email.trigger_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                              {getStatusBadge(email.status)}
                            </div>
                            <div className="text-sm text-gray-600">
                              To: {email.recipient_email}
                              {email.recipient_name && ` (${email.recipient_name})`}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            <div>Created: {new Date(email.created_at).toLocaleString()}</div>
                            {email.sent_at && (
                              <div>Sent: {new Date(email.sent_at).toLocaleString()}</div>
                            )}
                            {email.scheduled_at && email.scheduled_at !== email.created_at && (
                              <div>Scheduled: {new Date(email.scheduled_at).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        {email.error_message && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                            Error: {email.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Bulk Email Processor */}
      <BulkEmailProcessor onStatsUpdate={fetchStats} />

      {/* Settings Modal */}
      <EmailTriggerSettingsModal
        trigger={selectedTrigger}
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSelectedTrigger(null);
        }}
        onSave={handleSettingsSave}
      />
    </div>
  );
};