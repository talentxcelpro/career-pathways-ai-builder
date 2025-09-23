import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  certificate_data: {
    student_name: string;
    course_title: string;
    completion_date: string;
    instructor_name?: string;
    skills_acquired?: string[];
  };
  courses?: {
    title: string;
    instructor_name?: string;
    duration_hours?: number;
  };
}

export const useCertificates = (userId?: string) => {
  return useQuery({
    queryKey: ['certificates', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('course_certificates')
        .select(`
          *,
          courses (
            title,
            instructor_name,
            duration_hours
          )
        `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!userId,
  });
};

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { courseId, userId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certificates', variables.userId] });
      toast.success('Certificate generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate certificate: ' + error.message);
    },
  });
};