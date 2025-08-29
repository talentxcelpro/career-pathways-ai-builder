import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedJobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  current_role?: string;
  current_ctc?: number;
  expected_ctc?: number;
  notice_period?: string;
  preferred_location?: string;
  resume_url?: string;
  cover_letter_url?: string;
  additional_files?: any[];
  application_data?: any;
  created_at: string;
  updated_at: string;
  // Join fields
  jobs?: {
    title: string;
    company_name?: string;
    location?: string;
  };
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
    profile_picture_url?: string;
  };
}

export const useEnhancedJobApplications = (userId?: string) => {
  return useQuery({
    queryKey: ['enhanced-job-applications', userId],
    queryFn: async () => {
      let query = supabase
        .from('enhanced_job_applications')
        .select(`
          *,
          jobs(title, company_name, location),
          profiles(full_name, email, phone, profile_picture_url)
        `)
        .order('applied_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as EnhancedJobApplication[];
    }
  });
};

export const useCreateEnhancedJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationData: {
      job_id: string;
      resume_url?: string;
      cover_letter_url?: string;
      current_role?: string;
      current_ctc?: number;
      expected_ctc?: number;
      notice_period?: string;
      preferred_location?: string;
      additional_files?: any[];
      application_data?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('enhanced_job_applications')
        .insert({
          ...applicationData,
          user_id: user?.id,
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-job-applications'] });
      toast.success('Application submitted successfully');
    },
    onError: (error) => {
      console.error('Application failed:', error);
      toast.error('Failed to submit application');
    }
  });
};

export const useEmployerApplications = (jobId?: string) => {
  return useQuery({
    queryKey: ['employer-applications', jobId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_employer_applications', {
          employer_id: user.id,
          target_job_id: jobId || null
        });

      if (error) {
        throw new Error(error.message);
      }

      return data as any[];
    },
    enabled: true
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status, notes }: {
      applicationId: string;
      status: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .rpc('update_application_status', {
          application_id: applicationId,
          new_status: status,
          employer_notes: notes
        });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      toast.success('Application status updated');
    },
    onError: (error) => {
      console.error('Status update failed:', error);
      toast.error('Failed to update status');
    }
  });
};

export const useJobApplicationStats = () => {
  return useQuery({
    queryKey: ['enhanced-job-application-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('enhanced_job_applications')
        .select('status, applied_at')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      return {
        total: data.length,
        thisMonth: data.filter(app => new Date(app.applied_at) >= lastMonth).length,
        pending: data.filter(app => app.status === 'applied').length,
        statusBreakdown: data.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    }
  });
};