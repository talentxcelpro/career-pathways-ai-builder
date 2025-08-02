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
      // Generate HTML content from template
      const templateFunction = templates[config.template];
      if (!templateFunction) {
        throw new Error(`Template ${config.template} not found`);
      }

      const htmlContent = templateFunction(config.data);

      // Send email via edge function
      const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-email`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use secure authentication instead of hardcoded key
        },
        body: JSON.stringify({
          to: config.to,
          subject: config.subject,
          html: htmlContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${errorText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      
      return { success: true, result };
    } catch (error) {
      console.error('Email automation error:', error);
      throw error;
    } finally {
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