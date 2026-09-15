import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LearningAnalytics {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageProgress: number;
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
  monthlyStats: Array<{
    month: string;
    enrollments: number;
    completions: number;
  }>;
}

export const useLearningAnalytics = () => {
  return useQuery({
    queryKey: ['learning-analytics'],
    queryFn: async (): Promise<LearningAnalytics> => {
      try {
        // Get basic counts
        const [
          { count: totalCourses },
          { count: totalEnrollments },
          { data: enrollmentData }
        ] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
          supabase.from('course_enrollments').select(`
            id,
            completion_percentage,
            status,
            course_id,
            courses (
              id,
              title
            )
          `)
        ]);

        // Calculate completion rate
        const completedEnrollments = enrollmentData?.filter(e => e.status === 'completed').length || 0;
        const completionRate = totalEnrollments ? (completedEnrollments / totalEnrollments) * 100 : 0;

        // Calculate average progress
        const totalProgress = enrollmentData?.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) || 0;
        const averageProgress = totalEnrollments ? totalProgress / totalEnrollments : 0;

        // Get unique students count
        const uniqueStudents = new Set(enrollmentData?.map(e => e.id)).size;

        // Calculate top courses
        const courseStats = new Map();
        enrollmentData?.forEach(enrollment => {
          const courseId = enrollment.course_id;
          const courseName = (enrollment.courses as any)?.title || 'Unknown Course';
          
          if (!courseStats.has(courseId)) {
            courseStats.set(courseId, {
              id: courseId,
              title: courseName,
              enrollments: 0,
              completions: 0
            });
          }
          
          const stats = courseStats.get(courseId);
          stats.enrollments++;
          if (enrollment.status === 'completed') {
            stats.completions++;
          }
        });

        const topCourses = Array.from(courseStats.values())
          .map(course => ({
            ...course,
            completionRate: course.enrollments > 0 ? (course.completions / course.enrollments) * 100 : 0
          }))
          .sort((a, b) => b.enrollments - a.enrollments)
          .slice(0, 5);

        // Get recent activity (mock data for now)
        const recentActivity = [
          {
            type: 'enrollment',
            description: 'New student enrolled in React Basics',
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            type: 'completion',
            description: 'Student completed JavaScript Fundamentals',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          {
            type: 'course_created',
            description: 'New course "Advanced TypeScript" created',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
          }
        ];

        // Generate monthly stats (mock data for last 6 months)
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          
          monthlyStats.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            enrollments: Math.floor(Math.random() * 50) + 10,
            completions: Math.floor(Math.random() * 30) + 5
          });
        }

        return {
          totalStudents: uniqueStudents,
          totalCourses: totalCourses || 0,
          totalEnrollments: totalEnrollments || 0,
          completionRate: Math.round(completionRate),
          averageProgress: Math.round(averageProgress),
          topCourses,
          recentActivity,
          monthlyStats
        };
      } catch (error) {
        console.error('Error fetching learning analytics:', error);
        // Return default values on error
        return {
          totalStudents: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          completionRate: 0,
          averageProgress: 0,
          topCourses: [],
          recentActivity: [],
          monthlyStats: []
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  });
};

export const useCourseAnalytics = (courseId: string) => {
  return useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;

      const totalEnrollments = enrollments?.length || 0;
      const completedCount = enrollments?.filter(e => e.status === 'completed').length || 0;
      const averageProgress = enrollments?.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / totalEnrollments || 0;

      return {
        totalEnrollments,
        completedCount,
        completionRate: totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0,
        averageProgress: Math.round(averageProgress),
        inProgressCount: enrollments?.filter(e => e.status === 'in_progress').length || 0
      };
    },
    enabled: !!courseId,
  });
};

export const useUserLearningStats = (userId?: string) => {
  return useQuery({
    queryKey: ['user-learning-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_learning_analytics')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Calculate aggregate stats
      const totalTimeSpent = data.reduce((sum, record) => sum + (record.total_time_spent || 0), 0);
      const totalLessonsCompleted = data.reduce((sum, record) => sum + (record.lessons_completed || 0), 0);
      const averageEngagementScore = data.length > 0 
        ? data.reduce((sum, record) => sum + (record.engagement_score || 0), 0) / data.length
        : 0;
      const coursesInProgress = data.filter(record => record.completion_rate < 100).length;
      const coursesCompleted = data.filter(record => record.completion_rate >= 100).length;

      return {
        totalTimeSpent,
        totalLessonsCompleted,
        averageEngagementScore,
        coursesInProgress,
        coursesCompleted,
        totalCourses: data.length,
        rawData: data
      };
    },
    enabled: !!userId,
  });
};