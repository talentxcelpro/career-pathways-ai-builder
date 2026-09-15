import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TriggerEmailParams {
  triggerType: string;
  recipientEmail: string;
  templateData: Record<string, any>;
  delayMinutes?: number;
  priority?: 'high' | 'medium' | 'low';
}

export const useEmailTriggers = () => {
  const triggerEmail = async ({
    triggerType,
    recipientEmail,
    templateData,
    delayMinutes = 0,
    priority = 'medium'
  }: TriggerEmailParams) => {
    try {
      // Get the email trigger settings
      const { data: triggerSettings, error: settingsError } = await supabase
        .from('email_automation_settings')
        .select('*')
        .eq('trigger_type', triggerType)
        .eq('is_enabled', true)
        .single();

      if (settingsError || !triggerSettings) {
        console.log(`Email trigger ${triggerType} is not enabled or not found`);
        return { success: false, error: 'Trigger not enabled' };
      }

      // Queue the email
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .insert({
          recipient_email: recipientEmail,
          template_data: templateData,
          trigger_type: triggerType,
          status: 'pending',
          scheduled_at: new Date(Date.now() + (delayMinutes * 60 * 1000)).toISOString()
        })
        .select('id')
        .single();

      if (queueError) {
        console.error('Error queuing email:', queueError);
        return { success: false, error: queueError.message };
      }

      console.log(`Email ${triggerType} queued successfully:`, queueData.id);
      return { success: true, queueId: queueData.id };
    } catch (error: any) {
      console.error('Error triggering email:', error);
      return { success: false, error: error.message };
    }
  };

  // Network Module Triggers
  const triggerConnectionAccepted = async (recipientEmail: string, accepterName: string) => {
    return triggerEmail({
      triggerType: 'connection_accepted',
      recipientEmail,
      templateData: { name: accepterName, recipient_name: recipientEmail.split('@')[0] }
    });
  };

  const triggerMessageNotification = async (recipientEmail: string, senderName: string, messagePreview: string) => {
    return triggerEmail({
      triggerType: 'message_notification',
      recipientEmail,
      templateData: { 
        recipient_name: recipientEmail.split('@')[0],
        sender_name: senderName,
        message_preview: messagePreview
      }
    });
  };

  const triggerMentionNotification = async (recipientEmail: string, senderName: string, postId: string) => {
    return triggerEmail({
      triggerType: 'mention_in_post',
      recipientEmail,
      templateData: {
        mentioned_user: recipientEmail.split('@')[0],
        sender_name: senderName,
        post_id: postId
      }
    });
  };

  // Jobs Module Triggers
  const triggerJobStatusUpdate = async (recipientEmail: string, jobTitle: string, companyName: string, status: string, statusMessage?: string) => {
    return triggerEmail({
      triggerType: 'job_status_update',
      recipientEmail,
      templateData: {
        name: recipientEmail.split('@')[0],
        job_title: jobTitle,
        company_name: companyName,
        status,
        status_message: statusMessage
      }
    });
  };

  const triggerSavedJobReminder = async (recipientEmail: string, jobTitle: string, companyName: string, jobId: string, deadline?: string) => {
    return triggerEmail({
      triggerType: 'saved_job_reminder',
      recipientEmail,
      templateData: {
        name: recipientEmail.split('@')[0],
        job_title: jobTitle,
        company_name: companyName,
        job_id: jobId,
        deadline
      },
      delayMinutes: 2880, // 48 hours
      priority: 'high'
    });
  };

  const triggerDailyJobDigest = async (recipientEmail: string, userRole: string, location: string) => {
    return triggerEmail({
      triggerType: 'daily_job_digest',
      recipientEmail,
      templateData: {
        name: recipientEmail.split('@')[0],
        user_role: userRole,
        location
      }
    });
  };

  // Employer Module Triggers
  const triggerNewApplicantNotification = async (employerEmail: string, applicantName: string, jobTitle: string, jobId: string) => {
    return triggerEmail({
      triggerType: 'new_applicant_notification',
      recipientEmail: employerEmail,
      templateData: {
        employer_name: employerEmail.split('@')[0],
        applicant_name: applicantName,
        job_title: jobTitle,
        job_id: jobId
      },
      priority: 'high'
    });
  };

  const triggerEmployerOnboarding = async (employerEmail: string, employerName: string) => {
    return triggerEmail({
      triggerType: 'employer_onboarding',
      recipientEmail: employerEmail,
      templateData: { name: employerName }
    });
  };

  const triggerJobPostingExpiry = async (employerEmail: string, jobTitle: string, jobId: string) => {
    return triggerEmail({
      triggerType: 'job_posting_expiry',
      recipientEmail: employerEmail,
      templateData: {
        employer_name: employerEmail.split('@')[0],
        job_title: jobTitle,
        job_id: jobId
      },
      delayMinutes: 4320 // 3 days before expiry
    });
  };

  // Companies Module Triggers
  const triggerCompanyFollower = async (companyAdminEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'company_follower',
      recipientEmail: companyAdminEmail,
      templateData: {
        company_admin: companyAdminEmail.split('@')[0],
        user_name: userName
      }
    });
  };

  const triggerCompanyReview = async (companyAdminEmail: string, companyName: string, rating: number, reviewPreview: string) => {
    return triggerEmail({
      triggerType: 'company_review_alert',
      recipientEmail: companyAdminEmail,
      templateData: {
        company_admin: companyAdminEmail.split('@')[0],
        company_name: companyName,
        rating,
        review_preview: reviewPreview
      }
    });
  };

  const triggerBrandScoreUpdate = async (companyAdminEmail: string, companyName: string, brandScore: number) => {
    return triggerEmail({
      triggerType: 'employer_brand_score',
      recipientEmail: companyAdminEmail,
      templateData: {
        company_admin: companyAdminEmail.split('@')[0],
        company_name: companyName,
        brand_score: brandScore
      }
    });
  };

  // Resume Builder Module Triggers
  const triggerResumeCreated = async (userEmail: string, userName: string, resumeId: string) => {
    return triggerEmail({
      triggerType: 'resume_created',
      recipientEmail: userEmail,
      templateData: { name: userName, resume_id: resumeId }
    });
  };

  const triggerResumeUpdated = async (userEmail: string, userName: string, resumeId: string) => {
    return triggerEmail({
      triggerType: 'resume_updated',
      recipientEmail: userEmail,
      templateData: { name: userName, resume_id: resumeId }
    });
  };

  const triggerIncompleteResumeReminder = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'incomplete_resume_reminder',
      recipientEmail: userEmail,
      templateData: { name: userName },
      delayMinutes: 4320 // 3 days
    });
  };

  const triggerResumeViewed = async (userEmail: string, userName: string, jobTitle?: string) => {
    return triggerEmail({
      triggerType: 'resume_viewed_by_employer',
      recipientEmail: userEmail,
      templateData: { name: userName, job_title: jobTitle }
    });
  };

  // Tools & Services Module Triggers
  const triggerCareerMapReady = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'ai_career_map_ready',
      recipientEmail: userEmail,
      templateData: { name: userName }
    });
  };

  const triggerToolUnlocked = async (userEmail: string, userName: string, toolName: string, toolSlug: string) => {
    return triggerEmail({
      triggerType: 'tool_access_alert',
      recipientEmail: userEmail,
      templateData: { name: userName, tool_name: toolName, tool_slug: toolSlug }
    });
  };

  const triggerNewService = async (userEmail: string, userName: string, serviceName: string, serviceSlug: string) => {
    return triggerEmail({
      triggerType: 'new_service_alert',
      recipientEmail: userEmail,
      templateData: { name: userName, service_name: serviceName, service_slug: serviceSlug }
    });
  };

  const triggerResumeFeedback = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'resume_writing_feedback',
      recipientEmail: userEmail,
      templateData: { name: userName }
    });
  };

  // Learning Module Triggers
  const triggerCourseRecommendation = async (userEmail: string, userName: string, courseTitle: string, courseId: string) => {
    return triggerEmail({
      triggerType: 'course_recommendation',
      recipientEmail: userEmail,
      templateData: { name: userName, course_title: courseTitle, course_id: courseId }
    });
  };

  const triggerCourseCompletion = async (userEmail: string, userName: string, courseTitle: string) => {
    return triggerEmail({
      triggerType: 'course_completion',
      recipientEmail: userEmail,
      templateData: { name: userName, course_title: courseTitle }
    });
  };

  const triggerLearningReminder = async (userEmail: string, userName: string, courseTitle: string, courseId: string, progress: number) => {
    return triggerEmail({
      triggerType: 'learning_progress_reminder',
      recipientEmail: userEmail,
      templateData: { name: userName, course_title: courseTitle, course_id: courseId, progress }
    });
  };

  const triggerCertificateReady = async (userEmail: string, userName: string, courseTitle: string, certificateId: string) => {
    return triggerEmail({
      triggerType: 'certificate_ready',
      recipientEmail: userEmail,
      templateData: { name: userName, course_title: courseTitle, certificate_id: certificateId }
    });
  };

  // Colleges Module Triggers
  const triggerCampusJobOpportunity = async (userEmail: string, userName: string, collegeName: string, jobId: string) => {
    return triggerEmail({
      triggerType: 'campus_job_opportunity',
      recipientEmail: userEmail,
      templateData: { name: userName, college_name: collegeName, job_id: jobId }
    });
  };

  const triggerEventInvite = async (userEmail: string, userName: string, eventName: string, collegeName: string, eventId: string) => {
    return triggerEmail({
      triggerType: 'event_invite',
      recipientEmail: userEmail,
      templateData: { name: userName, event_name: eventName, college_name: collegeName, event_id: eventId }
    });
  };

  const triggerResumeBookNotification = async (userEmail: string, userName: string, collegeName: string) => {
    return triggerEmail({
      triggerType: 'college_resume_book',
      recipientEmail: userEmail,
      templateData: { name: userName, college_name: collegeName }
    });
  };

  const triggerStudentSpotlight = async (userEmail: string, userName: string, spotlightId: string) => {
    return triggerEmail({
      triggerType: 'student_spotlight',
      recipientEmail: userEmail,
      templateData: { name: userName, spotlight_id: spotlightId }
    });
  };

  // Cross-Module Smart Triggers
  const triggerWeeklySummary = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'weekly_activity_summary',
      recipientEmail: userEmail,
      templateData: { name: userName }
    });
  };

  const triggerMilestoneAchievement = async (userEmail: string, userName: string, milestone: string) => {
    return triggerEmail({
      triggerType: 'milestone_achievement',
      recipientEmail: userEmail,
      templateData: { name: userName, milestone }
    });
  };

  const triggerInactiveUserNudge = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'inactive_user_nudge',
      recipientEmail: userEmail,
      templateData: { name: userName }
    });
  };

  const triggerProfileIncompleteNudge = async (userEmail: string, userName: string) => {
    return triggerEmail({
      triggerType: 'profile_incomplete_nudge',
      recipientEmail: userEmail,
      templateData: { name: userName }
    });
  };

  return {
    // Core function
    triggerEmail,
    
    // Network Module
    triggerConnectionAccepted,
    triggerMessageNotification,
    triggerMentionNotification,
    
    // Jobs Module
    triggerJobStatusUpdate,
    triggerSavedJobReminder,
    triggerDailyJobDigest,
    
    // Employer Module
    triggerNewApplicantNotification,
    triggerEmployerOnboarding,
    triggerJobPostingExpiry,
    
    // Companies Module
    triggerCompanyFollower,
    triggerCompanyReview,
    triggerBrandScoreUpdate,
    
    // Resume Builder Module
    triggerResumeCreated,
    triggerResumeUpdated,
    triggerIncompleteResumeReminder,
    triggerResumeViewed,
    
    // Tools & Services Module
    triggerCareerMapReady,
    triggerToolUnlocked,
    triggerNewService,
    triggerResumeFeedback,
    
    // Learning Module
    triggerCourseRecommendation,
    triggerCourseCompletion,
    triggerLearningReminder,
    triggerCertificateReady,
    
    // Colleges Module
    triggerCampusJobOpportunity,
    triggerEventInvite,
    triggerResumeBookNotification,
    triggerStudentSpotlight,
    
    // Cross-Module Smart Triggers
    triggerWeeklySummary,
    triggerMilestoneAchievement,
    triggerInactiveUserNudge,
    triggerProfileIncompleteNudge
  };
};

// Utility function to interpolate template strings
const interpolateString = (template: string, data: Record<string, any>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
};