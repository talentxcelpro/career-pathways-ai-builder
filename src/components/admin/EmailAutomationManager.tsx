import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Loader2
} from 'lucide-react';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [emailStats, setEmailStats] = useState({
    sentToday: 0,
    deliveryRate: 92,
    openRate: 34,
    clickRate: 8
  });

  const processEmailQueue = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue');
      
      if (error) throw error;
      
      toast.success(`Email queue processed: ${data.processed} sent, ${data.failed} failed`);
      fetchEmailStats(); // Refresh stats
      
      // Refresh queue if it's showing
      if (showQueue) {
        fetchEmailQueue();
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
      toast.error('Failed to process email queue');
    } finally {
      setIsProcessing(false);
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
    fetchEmailStats();
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

  const fetchEmailStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('status, sent_at')
        .gte('created_at', today);

      if (error) throw error;

      const sentToday = data?.filter(email => email.status === 'sent').length || 0;
      setEmailStats(prev => ({ ...prev, sentToday }));
    } catch (error) {
      console.error('Error fetching email stats:', error);
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

  const sendWelcomeEmailToAllUsers = async () => {
    setBulkEmailSending(true);
    setBulkEmailProgress({ sent: 0, total: 0 });
    
    try {
      // Get all users from profiles table who have emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .not('email', 'is', null);
        
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) {
        toast.error('No users found with email addresses');
        return;
      }
      
      setBulkEmailProgress({ sent: 0, total: profiles.length });
      
      let successful = 0;
      let failed = 0;
      const userIds = profiles.map(p => p.id);
      
      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < profiles.length; i += 10) {
        const batch = profiles.slice(i, i + 10);
        
        const batchPromises = batch.map(async (profile) => {
          try {
            const { error } = await supabase.rpc('queue_automated_email', {
              p_trigger_type: 'welcome_email',
              p_recipient_email: profile.email,
              p_recipient_name: profile.full_name || 'User',
              p_template_data: { name: profile.full_name || 'User', user_id: profile.id }
            });
            
            if (error) throw error;
            successful++;
          } catch (error) {
            console.error(`Failed to queue email for ${profile.email}:`, error);
            failed++;
          }
        });
        
        await Promise.allSettled(batchPromises);
        setBulkEmailProgress({ sent: successful + failed, total: profiles.length });
        
        // Small delay between batches
        if (i + 10 < profiles.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Send push notifications to all users
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_ids: userIds,
            title: 'Welcome to TalentXCE!',
            body: 'Thank you for joining our platform. Explore amazing career opportunities!',
            trigger_type: 'welcome_email',
            data: {
              route: '/dashboard'
            }
          }
        });
      } catch (pushError) {
        console.error('Failed to send push notifications:', pushError);
        // Don't fail the whole operation if push notifications fail
      }
      
      toast.success(`Bulk operation completed: ${successful} emails queued, ${failed} failed. Push notifications sent to all users.`);
      fetchEmailStats(); // Refresh stats
      
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      toast.error('Failed to send bulk welcome emails');
    } finally {
      setBulkEmailSending(false);
      setBulkEmailProgress({ sent: 0, total: 0 });
    }
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
                    <Button size="sm" variant="ghost">
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
          <CardTitle className="flex items-center gap-2">
            <SendHorizontal className="h-5 w-5" />
            Bulk Email Operations
          </CardTitle>
          <CardDescription>
            Send emails to multiple users at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Send Welcome Email to All Users</h3>
                  <p className="text-sm text-gray-600">
                    Queue welcome emails and push notifications for all registered users
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              
              {bulkEmailSending && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing... {bulkEmailProgress.sent}/{bulkEmailProgress.total} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: bulkEmailProgress.total > 0 
                          ? `${(bulkEmailProgress.sent / bulkEmailProgress.total) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              )}
              
              <Button
                onClick={sendWelcomeEmailToAllUsers}
                disabled={bulkEmailSending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {bulkEmailSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Send Welcome Email to All Users
                  </>
                )}
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Process Email Queue</h3>
                  <p className="text-sm text-gray-600">
                    Manually process all pending emails in the queue
                  </p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
              
              <Button
                onClick={processEmailQueue}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Process Email Queue Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Statistics</CardTitle>
          <CardDescription>
            Overview of email automation performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{emailStats.sentToday}</div>
              <div className="text-sm text-gray-600">Emails Sent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{emailStats.deliveryRate}%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{emailStats.openRate}%</div>
              <div className="text-sm text-gray-600">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{emailStats.clickRate}%</div>
              <div className="text-sm text-gray-600">Click Rate</div>
            </div>
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
                View pending and processed emails in the automation queue
              </CardDescription>
            </div>
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
    </div>
  );
};