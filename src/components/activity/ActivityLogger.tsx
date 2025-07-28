import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Service for logging user activities
 */
export class ActivityLoggerService {
  /**
   * Log a user activity
   */
  static async logActivity(
    activityType: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    relatedEntityType?: string,
    relatedEntityId?: string,
    isPublic: boolean = true
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.warn('No authenticated user found for activity logging');
        return null;
      }

      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: user.user.id,
        p_activity_type: activityType,
        p_activity_title: title,
        p_activity_description: description || null,
        p_metadata: metadata || {},
        p_related_entity_type: relatedEntityType || null,
        p_related_entity_id: relatedEntityId || null,
        p_is_public: isPublic
      });

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Log profile update activity
   */
  static async logProfileUpdate(updatedFields: string[]) {
    return this.logActivity(
      'profile_updated',
      'Updated profile',
      `Updated ${updatedFields.join(', ')}`,
      { updated_fields: updatedFields },
      'profile'
    );
  }

  /**
   * Log connection request activity
   */
  static async logConnectionRequest(recipientId: string, recipientName: string) {
    return this.logActivity(
      'connection_requested',
      'Sent connection request',
      `Sent a connection request to ${recipientName}`,
      { recipient_id: recipientId },
      'connection'
    );
  }

  /**
   * Log new connection activity
   */
  static async logNewConnection(connectedUserId: string, connectedUserName: string) {
    return this.logActivity(
      'connection_made',
      'New connection made',
      `Connected with ${connectedUserName}`,
      { connected_with: connectedUserId },
      'connection'
    );
  }

  /**
   * Log profile view activity (private)
   */
  static async logProfileView(viewedUserId: string, viewedUserName: string) {
    return this.logActivity(
      'profile_viewed',
      'Viewed profile',
      `Viewed ${viewedUserName}'s profile`,
      { viewed_user_id: viewedUserId },
      'profile',
      viewedUserId,
      false // Private activity
    );
  }

  /**
   * Log skill addition activity
   */
  static async logSkillAdded(skills: string[]) {
    return this.logActivity(
      'skill_added',
      'Added new skills',
      `Added ${skills.length} new skill${skills.length > 1 ? 's' : ''}: ${skills.join(', ')}`,
      { skills },
      'profile'
    );
  }

  /**
   * Log resume update activity
   */
  static async logResumeUpdate(resumeId: string, resumeTitle: string) {
    return this.logActivity(
      'resume_updated',
      'Updated resume',
      `Updated resume: ${resumeTitle}`,
      { resume_id: resumeId },
      'resume',
      resumeId
    );
  }

  /**
   * Log job application activity
   */
  static async logJobApplication(jobId: string, jobTitle: string, companyName: string) {
    return this.logActivity(
      'job_applied',
      'Applied to job',
      `Applied for ${jobTitle} at ${companyName}`,
      { job_id: jobId, company_name: companyName },
      'job',
      jobId
    );
  }

  /**
   * Log course enrollment activity
   */
  static async logCourseEnrollment(courseId: string, courseTitle: string) {
    return this.logActivity(
      'course_enrolled',
      'Enrolled in course',
      `Enrolled in: ${courseTitle}`,
      { course_id: courseId },
      'course',
      courseId
    );
  }
}

/**
 * React hook for activity logging with authentication context
 */
export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = async (
    activityType: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    relatedEntityType?: string,
    relatedEntityId?: string,
    isPublic: boolean = true
  ) => {
    if (!user) {
      console.warn('No authenticated user for activity logging');
      return null;
    }

    return ActivityLoggerService.logActivity(
      activityType,
      title,
      description,
      metadata,
      relatedEntityType,
      relatedEntityId,
      isPublic
    );
  };

  return {
    logActivity,
    logProfileUpdate: ActivityLoggerService.logProfileUpdate,
    logConnectionRequest: ActivityLoggerService.logConnectionRequest,
    logNewConnection: ActivityLoggerService.logNewConnection,
    logProfileView: ActivityLoggerService.logProfileView,
    logSkillAdded: ActivityLoggerService.logSkillAdded,
    logResumeUpdate: ActivityLoggerService.logResumeUpdate,
    logJobApplication: ActivityLoggerService.logJobApplication,
    logCourseEnrollment: ActivityLoggerService.logCourseEnrollment,
  };
};