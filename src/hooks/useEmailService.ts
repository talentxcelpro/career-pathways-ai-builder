import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
  immediate?: boolean;
}

interface EmailServiceHook {
  sendEmail: (emailData: EmailData) => Promise<boolean>;
  queueEmail: (emailData: Omit<EmailData, 'immediate'>) => Promise<boolean>;
  isLoading: boolean;
}

export const useEmailService = (): EmailServiceHook => {
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (emailData: EmailData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting to send email via edge function:', emailData);
      
      // Use Supabase Edge Function instead of API route
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      const message = emailData.immediate ? 'Email sent successfully!' : 'Email queued successfully!';
      toast.success(message);
      return true;
    } catch (error: any) {
      console.error('Email service error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email';
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Email service is currently unavailable. The function may still be deploying. Please try again in a few minutes.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Email service not found. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const queueEmail = async (emailData: Omit<EmailData, 'immediate'>): Promise<boolean> => {
    return sendEmail({ ...emailData, immediate: false });
  };

  return {
    sendEmail,
    queueEmail,
    isLoading,
  };
};

// Utility functions for common email scenarios
export const emailUtils = {
  welcomeEmail: async (userEmail: string, userName: string) => {
    const { sendEmail } = useEmailService();
    return sendEmail({
      to: userEmail,
      subject: 'Welcome to TalentXcel! 🎉',
      template: 'welcome',
      data: { name: userName },
      immediate: true,
    });
  },

  connectionRequestEmail: async (
    recipientEmail: string,
    recipientName: string,
    requesterName: string,
    requesterTitle?: string,
    requesterCompany?: string
  ) => {
    const { queueEmail } = useEmailService();
    return queueEmail({
      to: recipientEmail,
      subject: `${requesterName} wants to connect with you`,
      template: 'new_connection',
      data: {
        recipient_name: recipientName,
        requester_name: requesterName,
        requester_title: requesterTitle,
        requester_company: requesterCompany,
      },
    });
  },

  jobMatchEmail: async (
    userEmail: string,
    userName: string,
    jobTitle: string,
    companyName: string,
    jobId: string,
    location?: string,
    salaryRange?: string,
    requirements?: string[]
  ) => {
    const { queueEmail } = useEmailService();
    return queueEmail({
      to: userEmail,
      subject: `New job match: ${jobTitle} at ${companyName}`,
      template: 'job_opening',
      data: {
        name: userName,
        job_title: jobTitle,
        company_name: companyName,
        job_id: jobId,
        location,
        salary_range: salaryRange,
        requirements,
      },
    });
  },

  applicationConfirmationEmail: async (
    userEmail: string,
    userName: string,
    jobTitle: string,
    companyName: string,
    applicationId: string
  ) => {
    const { sendEmail } = useEmailService();
    return sendEmail({
      to: userEmail,
      subject: `Application confirmed: ${jobTitle}`,
      template: 'application_confirmation',
      data: {
        name: userName,
        job_title: jobTitle,
        company_name: companyName,
        application_id: applicationId,
        applied_date: new Date().toISOString(),
      },
      immediate: true,
    });
  },

  teamInviteEmail: async (
    invitedEmail: string,
    invitedName: string,
    inviterName: string,
    companyName: string,
    role: string,
    inviteToken: string
  ) => {
    const { sendEmail } = useEmailService();
    return sendEmail({
      to: invitedEmail,
      subject: `You've been invited to join ${companyName}`,
      template: 'invite_member',
      data: {
        invited_name: invitedName,
        inviter_name: inviterName,
        company_name: companyName,
        role,
        invite_token: inviteToken,
      },
      immediate: true,
    });
  },

  interviewScheduledEmail: async (
    candidateEmail: string,
    candidateName: string,
    companyName: string,
    jobTitle: string,
    interviewDate: string,
    interviewTime: string,
    interviewType?: string,
    meetingLink?: string
  ) => {
    const { sendEmail } = useEmailService();
    return sendEmail({
      to: candidateEmail,
      subject: `Interview scheduled: ${jobTitle} at ${companyName}`,
      template: 'interview_scheduled',
      data: {
        candidate_name: candidateName,
        company_name: companyName,
        job_title: jobTitle,
        interview_date: interviewDate,
        interview_time: interviewTime,
        interview_type: interviewType,
        meeting_link: meetingLink,
      },
      immediate: true,
    });
  },
};