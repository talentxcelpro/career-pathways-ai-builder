
import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useJobs = (filters?: {
  search?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  isRemote?: boolean;
}) => {
  const jobsQuery = useSupabaseQuery(
    ['jobs', JSON.stringify(filters || {})],
    async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            location
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.employmentType) {
        query = query.eq('employment_type', filters.employmentType);
      }
      if (filters?.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel);
      }
      if (filters?.isRemote !== undefined) {
        query = query.eq('is_remote', filters.isRemote);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    { requireAuth: false }
  );

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
  };
};

export const useJobDetails = (jobId: string) => {
  const jobQuery = useSupabaseQuery(
    ['job', jobId],
    async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            location,
            description,
            website,
            industry
          )
        `)
        .eq('id', jobId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    { requireAuth: false }
  );

  return {
    job: jobQuery.data,
    isLoading: jobQuery.isLoading,
    error: jobQuery.error,
  };
};

export const useJobApplication = () => {
  const { user } = useAuth();

  const applyToJobMutation = useSupabaseMutation(
    async ({ jobId, resumeUrl, coverLetter }: {
      jobId: string;
      resumeUrl?: string;
      coverLetter?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          resume_url: resumeUrl,
          cover_letter: coverLetter,
        })
        .select()
        .single();

      if (error) throw error;

      // Increment application count
      await supabase.rpc('increment_job_applications', { job_id: jobId });

      return data;
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Application submitted successfully!",
        });
      },
    }
  );

  const getUserApplications = () => useSupabaseQuery(
    ['user-applications', user?.id || ''],
    async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            employment_type,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { enabled: !!user?.id }
  );

  return {
    applyToJob: applyToJobMutation.mutate,
    isApplying: applyToJobMutation.isPending,
    getUserApplications,
  };
};

export const useSavedJobs = () => {
  const { user } = useAuth();

  const savedJobsQuery = useSupabaseQuery(
    ['saved-jobs', user?.id || ''],
    async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs (
            *,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { enabled: !!user?.id }
  );

  const saveJobMutation = useSupabaseMutation(
    async (jobId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_jobs')
        .insert({
          job_id: jobId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['saved-jobs', user?.id || '']],
    }
  );

  const unsaveJobMutation = useSupabaseMutation(
    async (jobId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    {
      invalidateQueries: [['saved-jobs', user?.id || '']],
    }
  );

  return {
    savedJobs: savedJobsQuery.data || [],
    isLoading: savedJobsQuery.isLoading,
    saveJob: saveJobMutation.mutate,
    unsaveJob: unsaveJobMutation.mutate,
    isSaving: saveJobMutation.isPending,
    isUnsaving: unsaveJobMutation.isPending,
  };
};
