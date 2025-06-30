
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useResumeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: resumeStats } = useQuery({
    queryKey: ['resume-stats'],
    queryFn: async () => {
      const [
        { count: totalResumes },
        { count: publicResumes },
        { count: totalCoverLetters },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('ai_resumes').select('*', { count: 'exact', head: true }),
        supabase.from('ai_resumes').select('*', { count: 'exact', head: true }).eq('is_public', true),
        supabase.from('ai_cover_letters').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('resume_url', 'is', null)
      ]);

      return {
        totalResumes: totalResumes || 0,
        publicResumes: publicResumes || 0,
        totalCoverLetters: totalCoverLetters || 0,
        activeUsers: activeUsers || 0
      };
    }
  });

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['admin-resumes', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('ai_resumes')
        .select(`
          *,
          profiles!ai_resumes_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: coverLetters } = useQuery({
    queryKey: ['admin-cover-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_cover_letters')
        .select(`
          *,
          profiles!ai_cover_letters_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const deleteResume = useMutation({
    mutationFn: async (resumeId: string) => {
      const { error } = await supabase
        .from('ai_resumes')
        .delete()
        .eq('id', resumeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Resume deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete resume');
    }
  });

  return {
    searchTerm,
    setSearchTerm,
    resumeStats,
    resumes,
    coverLetters,
    isLoading,
    deleteResume: (resumeId: string) => deleteResume.mutate(resumeId)
  };
};
