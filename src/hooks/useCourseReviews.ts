import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  is_public: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name?: string;
    profile_picture_url?: string;
  };
}

export const useCourseReviews = (courseId: string) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          user_profiles!inner (
            full_name,
            profile_picture_url
          )
        `)
        .eq('course_id', courseId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CourseReview[];
    },
    enabled: !!courseId,
  });
};

export const useUserCourseReview = (courseId: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-course-review', courseId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as CourseReview | null;
    },
    enabled: !!courseId && !!userId,
  });
};

export const useSubmitCourseReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: {
      course_id: string;
      rating: number;
      review_text?: string;
      is_public?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('course_reviews')
        .upsert({
          ...reviewData,
          user_id: user.id,
          is_public: reviewData.is_public ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', data.course_id] });
      queryClient.invalidateQueries({ queryKey: ['user-course-review', data.course_id] });
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit review: ' + error.message);
    },
  });
};

export const useDeleteCourseReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('course_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-course-review'] });
      toast.success('Review deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete review: ' + error.message);
    },
  });
};

export const useCourseRatingStats = (courseId: string) => {
  return useQuery({
    queryKey: ['course-rating-stats', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('rating')
        .eq('course_id', courseId)
        .eq('is_public', true);

      if (error) throw error;
      
      if (data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const ratings = data.map(r => r.rating);
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      const ratingDistribution = ratings.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: data.length,
        ratingDistribution: {
          1: ratingDistribution[1] || 0,
          2: ratingDistribution[2] || 0,
          3: ratingDistribution[3] || 0,
          4: ratingDistribution[4] || 0,
          5: ratingDistribution[5] || 0,
        }
      };
    },
    enabled: !!courseId,
  });
};