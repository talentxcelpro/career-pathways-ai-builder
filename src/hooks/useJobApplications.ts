import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  applied_at: string;
  resume_url?: string;
  status: string;
  application_data: any;
  created_at: string;
  updated_at: string;
  jobs?: {
    title: string;
    company_name?: string;
    location?: string;
  };
}

export const useJobApplications = (userId?: string) => {
  return useQuery({
    queryKey: ['job-applications', userId],
    queryFn: async () => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          jobs(title, company_name, location)
        `)
        .order('applied_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as any[];
    }
  });
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();
  const { triggerJobApplied } = useTXCIntegration();

  return useMutation({
    mutationFn: async (applicationData: {
      job_id: string;
      resume_url?: string;
      application_data?: any;
    }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          ...applicationData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      
      // Trigger TXC mining for job application with real-time updates
      try {
        const success = await triggerJobApplied();
        if (success) {
          toast.success('🎉 Application submitted! +90 TXC earned!');
        } else {
          toast.success('Application submitted successfully');
        }
      } catch (error) {
        console.error('Error earning TXC for job application:', error);
        toast.success('Application submitted successfully');
      }
    },
    onError: (error) => {
      console.error('Application failed:', error);
      toast.error('Failed to submit application');
    }
  });
};

export const useJobApplicationStats = () => {
  return useQuery({
    queryKey: ['job-application-stats'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await supabase
        .from('job_applications')
        .select('status, applied_at')
        .eq('user_id', user.data.user.id);

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

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete application:', error);
      toast.error('Failed to delete application');
    }
  });
};