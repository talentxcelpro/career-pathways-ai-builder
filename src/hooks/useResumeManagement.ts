
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ResumeWithProfile = {
  id: string;
  user_id: string;
  title: string;
  content: any;
  ats_score: number;
  is_public: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  template_id: string;
  public_url_slug: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
};

type CoverLetterWithProfile = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tone: string;
  job_title: string;
  company_name: string;
  template_id: string;
  resume_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
};

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
    queryFn: async (): Promise<ResumeWithProfile[]> => {
      let query = supabase
        .from('ai_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data: resumeData, error } = await query;
      if (error) throw error;

      if (resumeData && resumeData.length > 0) {
        const userIds = resumeData.map(resume => resume.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        return resumeData.map(resume => ({
          ...resume,
          profiles: profiles?.find(profile => profile.id === resume.user_id)
        }));
      }

      return resumeData || [];
    }
  });

  const { data: coverLetters } = useQuery({
    queryKey: ['admin-cover-letters'],
    queryFn: async (): Promise<CoverLetterWithProfile[]> => {
      const { data: letterData, error } = await supabase
        .from('ai_cover_letters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;

      if (letterData && letterData.length > 0) {
        const userIds = letterData.map(letter => letter.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        return letterData.map(letter => ({
          ...letter,
          profiles: profiles?.find(profile => profile.id === letter.user_id)
        }));
      }

      return letterData || [];
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
