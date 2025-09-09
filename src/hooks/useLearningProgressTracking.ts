import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_minutes: number;
  last_position_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ProgressUpdate {
  lessonId: string;
  courseId: string;
  progressPercentage?: number;
  timeSpentMinutes?: number;
  lastPositionSeconds?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export const useLearningProgressTracking = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(false);

  // Real-time subscription to progress updates
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const subscription = supabase
        .channel('user_lesson_progress')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_lesson_progress',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Progress update received:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newProgress = payload.new as LessonProgress;
              setProgress(prev => ({
                ...prev,
                [newProgress.lesson_id]: newProgress
              }));
            } else if (payload.eventType === 'DELETE') {
              const deletedProgress = payload.old as LessonProgress;
              setProgress(prev => {
                const updated = { ...prev };
                delete updated[deletedProgress.lesson_id];
                return updated;
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    setupSubscription();
  }, []);

  const fetchLessonProgress = useCallback(async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  }, []);

  const updateProgress = useCallback(async (update: ProgressUpdate) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to track progress');
        return;
      }

      // Determine status based on progress percentage
      let status = update.status;
      if (!status && update.progressPercentage !== undefined) {
        if (update.progressPercentage >= 90) {
          status = 'completed';
        } else if (update.progressPercentage > 0) {
          status = 'in_progress';
        } else {
          status = 'not_started';
        }
      }

      const updateData: any = {
        user_id: user.id,
        lesson_id: update.lessonId,
        course_id: update.courseId,
        updated_at: new Date().toISOString()
      };

      if (update.progressPercentage !== undefined) {
        updateData.progress_percentage = update.progressPercentage;
      }
      if (update.timeSpentMinutes !== undefined) {
        updateData.time_spent_minutes = update.timeSpentMinutes;
      }
      if (update.lastPositionSeconds !== undefined) {
        updateData.last_position_seconds = update.lastPositionSeconds;
      }
      if (status) {
        updateData.status = status;
        if (status === 'completed' && !updateData.completed_at) {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [update.lessonId]: data
      }));

      // Track analytics
      await supabase
        .from('learning_analytics')
        .insert({
          user_id: user.id,
          course_id: update.courseId,
          lesson_id: update.lessonId,
          activity_type: status === 'completed' ? 'lesson_complete' : 'video_watch',
          duration_seconds: update.timeSpentMinutes ? update.timeSpentMinutes * 60 : 0,
          metadata: {
            progress_percentage: update.progressPercentage,
            last_position: update.lastPositionSeconds
          }
        });

      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackVideoProgress = useCallback(async (
    lessonId: string,
    positionSeconds: number,
    progressPercentage?: number
  ) => {
    try {
      // Use the database function for efficient video progress tracking
      const { error } = await supabase.rpc('track_video_progress', {
        p_lesson_id: lessonId,
        p_position_seconds: positionSeconds,
        p_progress_percentage: progressPercentage
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking video progress:', error);
      // Fallback to regular progress update
      if (error.message?.includes('does not exist')) {
        // Function doesn't exist, use regular update
        const { data: lesson } = await supabase
          .from('course_lessons')
          .select('course_id')
          .eq('id', lessonId)
          .single();

        if (lesson) {
          await updateProgress({
            lessonId,
            courseId: lesson.course_id,
            progressPercentage,
            lastPositionSeconds: positionSeconds
          });
        }
      }
    }
  }, [updateProgress]);

  const markLessonComplete = useCallback(async (lessonId: string, courseId: string) => {
    return updateProgress({
      lessonId,
      courseId,
      progressPercentage: 100,
      status: 'completed'
    });
  }, [updateProgress]);

  const getCourseProgress = useCallback(async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get all lessons for the course
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId);

      if (!lessons) return null;

      // Get progress for all lessons
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      const totalLessons = lessons.length;
      const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
      const totalProgress = progressData?.reduce((sum, p) => sum + p.progress_percentage, 0) || 0;
      const averageProgress = totalLessons > 0 ? totalProgress / totalLessons : 0;

      return {
        courseId,
        totalLessons,
        completedLessons,
        averageProgress,
        isCompleted: completedLessons === totalLessons,
        lessons: progressData || []
      };
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }, []);

  const resetProgress = useCallback(async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_lesson_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const updated = { ...prev };
        delete updated[lessonId];
        return updated;
      });

      toast.success('Progress reset successfully');
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  }, []);

  return {
    progress,
    loading,
    updateProgress,
    trackVideoProgress,
    markLessonComplete,
    fetchLessonProgress,
    getCourseProgress,
    resetProgress
  };
};