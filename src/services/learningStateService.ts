import { supabase } from '@/integrations/supabase/client';
import { AggregatedCourse } from '@/types/learningAggregator';

export type CourseStateStatus = 'SAVED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface CourseUserProgress {
  courseId: string;
  courseTitle: string;
  providerName: string;
  status: CourseStateStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  certificateUrl?: string;
  skillsEarned: string[];
}

const STORAGE_KEY = 'talentxcel_learning_progress_state';

export const learningStateService = {

  /**
   * Get all learning progress records for current user
   */
  async getUserLearningStates(): Promise<Record<string, CourseUserProgress>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Learning state parse error:", e);
    }
    return {};
  },

  /**
   * Update or record status transition for a course
   */
  async updateCourseStatus(
    course: AggregatedCourse,
    status: CourseStateStatus,
    extra?: { notes?: string; certificateUrl?: string }
  ): Promise<CourseUserProgress> {
    const states = await this.getUserLearningStates();
    const existing = states[course.id];

    const updated: CourseUserProgress = {
      courseId: course.id,
      courseTitle: course.title,
      providerName: course.provider_name,
      status: status,
      startedAt: existing?.startedAt || (status === 'STARTED' || status === 'IN_PROGRESS' ? new Date().toISOString() : undefined),
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : existing?.completedAt,
      notes: extra?.notes || existing?.notes || '',
      certificateUrl: extra?.certificateUrl || existing?.certificateUrl || '',
      skillsEarned: course.skills || []
    };

    states[course.id] = updated;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
      
      // Best effort log to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_activity_log').insert({
          admin_user_id: user.id,
          action_type: `COURSE_STATE_${status}`,
          details: { course_id: course.id, status, updated_at: new Date().toISOString() } as any
        });
      }
    } catch (err) {
      console.warn("Learning state update notice:", err);
    }

    return updated;
  },

  /**
   * Automatically transition course to STARTED when external handoff CTA is clicked
   */
  async recordHandoffStart(course: AggregatedCourse): Promise<CourseUserProgress> {
    return this.updateCourseStatus(course, 'STARTED');
  }
};
