import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Mail, Users, TrendingUp, Activity, BarChart3, Shield } from 'lucide-react';
import { EmailTriggerSettingsModal } from './EmailTriggerSettingsModal';
import { BulkEmailProcessor } from './BulkEmailProcessor';
import { EmailAnalyticsDashboard } from './EmailAnalyticsDashboard';
import { RealTimeEmailAnalytics } from './RealTimeEmailAnalytics';
import { EmailDeliveryDiagnostics } from './EmailDeliveryDiagnostics';
import { EmailConfigurationGuide } from './EmailConfigurationGuide';
import { ProfileCompletionInsights } from './ProfileCompletionInsights';
import { EmailDeliveryTracker } from './EmailDeliveryTracker';

interface EmailTrigger {
  id: string;
  trigger_type: string;
  is_enabled: boolean;
  template_name: string;
  subject_template: string;
  html_template?: string;
  delay_minutes: number;
  name: string;
  description: string;
}

export const EmailAutomationManager: React.FC = () => {
  const [triggers, setTriggers] = useState<EmailTrigger[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<EmailTrigger | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'triggers' | 'analytics' | 'bulk' | 'realtime' | 'insights' | 'delivery'>('triggers');

  const defaultTriggers: EmailTrigger[] = [
    {
      id: 'user_registration',
      trigger_type: 'user_registration',
      is_enabled: true,
      template_name: 'welcome_email',
      subject_template: 'Welcome to TalentXcel, {{name}}!',
      html_template: '<h1>Welcome {{name}}!</h1><p>Thank you for joining TalentXcel. We\'re excited to help you find your dream job!</p>',
      delay_minutes: 0,
      name: 'User Registration',
      description: 'Sent when a new user creates an account'
    },
    {
      id: 'job_application_submitted',
      trigger_type: 'job_application',
      is_enabled: true,
      template_name: 'application_confirmation',
      subject_template: 'Application Submitted - {{job_title}}',
      html_template: '<h1>Application Received</h1><p>We\'ve received your application for {{job_title}} at {{company_name}}.</p>',
      delay_minutes: 5,
      name: 'Job Application Submitted',
      description: 'Sent when a user submits a job application'
    },
    {
      id: 'employer_request_approved',
      trigger_type: 'employer_approval',
      is_enabled: true,
      template_name: 'employer_approval',
      subject_template: 'Your Employer Account is Approved!',
      html_template: '<h1>Congratulations!</h1><p>Your employer account has been approved. You can now start posting jobs.</p>',
      delay_minutes: 0,
      name: 'Employer Request Approved',
      description: 'Sent when an employer request is approved'
    },
    {
      id: 'profile_incomplete_reminder',
      trigger_type: 'profile_reminder',
      is_enabled: false,
      template_name: 'profile_reminder',
      subject_template: 'Complete Your Profile - {{name}}',
      html_template: '<h1>Hi {{name}}</h1><p>Don\'t forget to complete your profile to get better job recommendations!</p>',
      delay_minutes: 1440,
      name: 'Profile Incomplete Reminder',
      description: 'Sent to users with incomplete profiles after 24 hours'
    },
    {
      id: 'job_match_notification',
      trigger_type: 'job_match',
      is_enabled: true,
      template_name: 'job_match',
      subject_template: 'New Job Match - {{job_title}}',
      html_template: '<h1>Perfect Match Found!</h1><p>We found a job that matches your skills: {{job_title}} at {{company_name}}.</p>',
      delay_minutes: 0,
      name: 'Job Match Notification',
      description: 'Sent when a job matches user preferences'
    }
  ];

  const fetchTriggers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_automation_settings')
        .select('*')
        .order('trigger_type');

      if (error) {
        console.error('Error fetching triggers:', error);
        setTriggers(defaultTriggers);
      } else if (data && data.length > 0) {
        const mappedTriggers = data.map(trigger => ({
          ...trigger,
          name: getDisplayName(trigger.trigger_type),
          description: getDescription(trigger.trigger_type)
        }));
        setTriggers(mappedTriggers);
      } else {
        setTriggers(defaultTriggers);
      }
    } catch (error) {
      console.error('Error fetching triggers:', error);
      setTriggers(defaultTriggers);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (triggerType: string): string => {
    const mapping: Record<string, string> = {
      user_registration: 'User Registration',
      job_application: 'Job Application Submitted',
      employer_approval: 'Employer Request Approved',
      profile_reminder: 'Profile Incomplete Reminder',
      profile_completion_reminder: 'Profile Completion Reminder',
      job_match: 'Job Match Notification'
    };
    return mapping[triggerType] || triggerType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDescription = (triggerType: string): string => {
    const mapping: Record<string, string> = {
      user_registration: 'Sent when a new user creates an account',
      job_application: 'Sent when a user submits a job application',
      employer_approval: 'Sent when an employer request is approved',
      profile_reminder: 'Sent to users with incomplete profiles after 24 hours',
      profile_completion_reminder: 'Professional email encouraging users to complete their profile and unlock features',
      job_match: 'Sent when a job matches user preferences'
    };
    return mapping[triggerType] || 'Email trigger';
  };

  useEffect(() => {
    fetchTriggers();
  }, []);

  const handleToggleTrigger = async (triggerId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automation_settings')
        .update({ is_enabled: isEnabled })
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, is_enabled: isEnabled }
          : trigger
      ));

      toast.success(`Email trigger ${isEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast.error('Failed to update email trigger');
    }
  };

  const handleOpenSettings = (trigger: EmailTrigger) => {
    setSelectedTrigger(trigger);
    setIsSettingsModalOpen(true);
  };

  const handleSaveTrigger = (updatedTrigger: EmailTrigger) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === updatedTrigger.id ? updatedTrigger : trigger
    ));
  };

  const tabButtons = [
    { id: 'triggers' as const, label: 'Email Triggers', icon: Mail },
    { id: 'insights' as const, label: 'Profile Insights', icon: BarChart3 },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { id: 'bulk' as const, label: 'Bulk Email', icon: Users },
    { id: 'realtime' as const, label: 'Real-time Queue', icon: Activity },
    { id: 'delivery' as const, label: 'Delivery Tracking', icon: Shield }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabButtons.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'triggers' && (
        <>
          {/* Email Configuration Guide */}
          <EmailConfigurationGuide />
          
          {/* Email Delivery Diagnostics */}
          <EmailDeliveryDiagnostics />
        </>
      )}
      
      {activeTab === 'triggers' && (
        <div className="grid gap-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{trigger.name}</h3>
                      <Badge variant={trigger.is_enabled ? "default" : "secondary"}>
                        {trigger.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {trigger.delay_minutes > 0 && (
                        <Badge variant="outline">
                          Delay: {trigger.delay_minutes}m
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {trigger.description}
                    </p>
                    <p className="text-sm font-medium">
                      Subject: {trigger.subject_template}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={trigger.is_enabled}
                      onCheckedChange={(checked) => handleToggleTrigger(trigger.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSettings(trigger)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'insights' && <ProfileCompletionInsights />}
      {activeTab === 'analytics' && <EmailAnalyticsDashboard />}
      {activeTab === 'bulk' && <BulkEmailProcessor />}
      {activeTab === 'realtime' && <RealTimeEmailAnalytics />}
      {activeTab === 'delivery' && <EmailDeliveryTracker />}

      <EmailTriggerSettingsModal
        trigger={selectedTrigger}
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSelectedTrigger(null);
        }}
        onSave={handleSaveTrigger}
      />
    </div>
  );
};
