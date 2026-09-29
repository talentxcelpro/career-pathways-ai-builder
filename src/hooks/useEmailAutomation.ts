import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import templates, { TemplateData } from '@/lib/emailTemplates';
import { toast } from 'sonner';

interface EmailAutomationConfig {
  template: keyof typeof templates;
  trigger: string;
  data: TemplateData;
  to: string;
  subject: string;
}

export const useEmailAutomation = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendAutomatedEmail = async (config: EmailAutomationConfig) => {
    setIsProcessing(true);
    try {
      // 1. Primary: Centralized Email API (/api/email/send)
      try {
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: config.to,
            recipientName: config.data?.name || config.data?.recipient_name || 'User',
            template: config.template,
            category: 'product_notification',
            priority: 3,
            variables: {
              subject: config.subject,
              ...config.data
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          return { success: true, result: data };
        }
      } catch (fetchErr) {
        console.warn('API send fetch error, trying direct queue fallback:', fetchErr);
      }

      // 2. Resilient Database Queue Fallback (email_automation_queue)
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .insert({
          trigger_type: config.template,
          recipient_email: config.to,
          recipient_name: config.data?.name || config.data?.recipient_name || 'User',
          template_data: {
            subject: config.subject,
            ...config.data
          },
          status: 'pending',
          scheduled_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (queueError) {
        // Fallback to RPC if direct insert fails
        await (supabase as any).rpc('enqueue_email_event', {
          p_event_key: config.template,
          p_recipient_email: config.to,
          p_recipient_name: config.data?.name || config.data?.recipient_name || 'User',
          p_template_data: config.data,
          p_delay_minutes: 0
        });
      }

      return { success: true, queued: true, result: queueData };
    } catch (error: any) {
      console.error('Email automation error:', error);
      toast.error('Failed to dispatch email');
      return { success: false, error: error?.message };
    } finally {
      setIsProcessing(false);
    }
  };
      setIsProcessing(false);
    }
  };

  // Predefined automation triggers
  const triggerWelcomeEmail = async (userEmail: string, firstName: string) => {
    return sendAutomatedEmail({
      template: 'welcome',
      trigger: 'user_signup',
      to: userEmail,
      subject: 'Welcome to TalentXcel! 🎉',
      data: { first_name: firstName }
    });
  };

  const triggerConnectionEmail = async (recipientEmail: string, recipientName: string, senderName: string) => {
    return sendAutomatedEmail({
      template: 'new_connection',
      trigger: 'connection_request',
      to: recipientEmail,
      subject: `${senderName} wants to connect with you`,
      data: { 
        first_name: recipientName,
        sender_name: senderName
      }
    });
  };

  const triggerJobRecommendationEmail = async (userEmail: string, userName: string, jobs: any[]) => {
    return sendAutomatedEmail({
      template: 'job_opening',
      trigger: 'job_match',
      to: userEmail,
      subject: 'New job opportunities matched for you!',
      data: {
        first_name: userName,
        job_title_1: jobs[0]?.title || 'Software Engineer',
        company_1: jobs[0]?.company || 'TechCorp',
        job_title_2: jobs[1]?.title || 'Product Manager',
        company_2: jobs[1]?.company || 'InnovaCorp',
        job_title_3: jobs[2]?.title || 'Data Analyst',
        company_3: jobs[2]?.company || 'DataTech'
      }
    });
  };

  const triggerApplicationConfirmationEmail = async (
    userEmail: string, 
    userName: string, 
    jobTitle: string, 
    companyName: string
  ) => {
    try {
      // Queue email using the new automation system
      const { error } = await supabase
        .from('email_automation_queue')
        .insert({
          trigger_type: 'application_confirmation',
          recipient_email: userEmail,
          recipient_name: userName,
          template_data: {
            name: userName,
            recipient_name: userName,
            job_title: jobTitle,
            company_name: companyName,
            application_id: 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          },
          scheduled_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to queue application confirmation email:', error);
        throw error;
      }

      console.log('Application confirmation email queued successfully');
      return { success: true };
    } catch (error) {
      console.error('Error triggering application confirmation email:', error);
      throw error;
    }
  };

  const triggerTeamInviteEmail = async (
    inviteEmail: string,
    inviterName: string,
    inviteCode: string
  ) => {
    return sendAutomatedEmail({
      template: 'invite_member',
      trigger: 'team_invite',
      to: inviteEmail,
      subject: `You've been invited to join ${inviterName}'s team`,
      data: {
        inviter_name: inviterName,
        invite_code: inviteCode
      }
    });
  };

  const triggerPasswordResetEmail = async (userEmail: string, userName: string, resetLink: string) => {
    return sendAutomatedEmail({
      template: 'password_reset',
      trigger: 'password_reset',
      to: userEmail,
      subject: 'Reset your TalentXcel password',
      data: {
        first_name: userName,
        reset_link: resetLink
      }
    });
  };

  const triggerInterviewScheduledEmail = async (
    userEmail: string,
    userName: string,
    jobTitle: string,
    companyName: string,
    interviewDatetime: string,
    meetingLink?: string
  ) => {
    return sendAutomatedEmail({
      template: 'interview_scheduled',
      trigger: 'interview_scheduled',
      to: userEmail,
      subject: `Interview scheduled for ${jobTitle}`,
      data: {
        first_name: userName,
        job_title: jobTitle,
        company_name: companyName,
        interview_datetime: interviewDatetime,
        interview_mode: meetingLink ? 'Virtual' : 'In-person',
        meeting_link: meetingLink
      }
    });
  };

  const triggerMonthlyDigestEmail = async (
    userEmail: string,
    userName: string,
    stats: {
      connections_count: number;
      jobs_applied: number;
      certifications_count: number;
      jobs_suggested: number;
    }
  ) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return sendAutomatedEmail({
      template: 'monthly_digest',
      trigger: 'monthly_digest',
      to: userEmail,
      subject: `Your TalentXcel highlights for ${currentMonth}`,
      data: {
        first_name: userName,
        month: currentMonth,
        ...stats
      }
    });
  };

  const triggerProfileCompletionReminder = async (userEmail: string, userName: string) => {
    try {
      // Queue email using the new automation system
      const { error } = await supabase
        .from('email_automation_queue')
        .insert({
          trigger_type: 'profile_completion_reminder',
          recipient_email: userEmail,
          recipient_name: userName,
          template_data: {
            name: userName || 'there',
            recipient_name: userName || 'there'
          },
          scheduled_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to queue profile completion reminder:', error);
        throw error;
      }

      console.log('Profile completion reminder queued successfully');
      return { success: true };
    } catch (error) {
      console.error('Error triggering profile completion reminder:', error);
      throw error;
    }
  };

  return {
    isProcessing,
    sendAutomatedEmail,
    triggerWelcomeEmail,
    triggerConnectionEmail,
    triggerJobRecommendationEmail,
    triggerApplicationConfirmationEmail,
    triggerTeamInviteEmail,
    triggerPasswordResetEmail,
    triggerInterviewScheduledEmail,
    triggerMonthlyDigestEmail,
    triggerProfileCompletionReminder
  };
};