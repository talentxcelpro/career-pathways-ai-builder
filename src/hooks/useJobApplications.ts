import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';
import { analyzeATSFit, serializeATSResultForStorage } from '@/lib/resume/atsEngine';


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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Insert the job application
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          ...applicationData,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Forward application to publisher immediately after successful insert
      try {
        const forwardingResult = await supabase.functions.invoke('forward-application-to-publisher', {
          body: {
            job_id: applicationData.job_id,
            applicant_data: {
              ...applicationData.application_data,
              resume_url: applicationData.resume_url
            }
          }
        });

        if (forwardingResult.error) {
          console.error('Application forwarding failed:', forwardingResult.error);
        } else {
          console.log('✅ Application forwarded to publisher:', forwardingResult.data);
        }
      } catch (forwardingError) {
        console.error('Error forwarding application:', forwardingError);
        // Don't fail the entire process if forwarding fails
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

/**
 * useAnalyzeAndPersistATSFit
 *
 * Phase 1: After a job application is submitted, run the real ATS analysis
 * and persist results into job_applications.application_data.
 *
 * SAFE MERGE: Only writes to the 'ats_analysis' key inside application_data.
 * All other keys in application_data are preserved unchanged.
 *
 * NON-BLOCKING: If analysis fails for any reason, the application record
 * is unchanged and the user is shown 'ATS analysis unavailable' — not an error.
 *
 * MASTER RESUME: ai_resumes.content is never written to.
 */
export const useAnalyzeAndPersistATSFit = () => {
  return async (params: {
    applicationId: string;
    resumeId: string;
    jobId: string;
    userId: string;
    existingApplicationData?: Record<string, unknown>;
  }): Promise<{ persisted: boolean; score: number | null }> => {
    const { applicationId, resumeId, jobId, userId, existingApplicationData = {} } = params;

    try {
      // Run the real ATS analysis (read-only against ai_resumes and jobs)
      const atsResult = await analyzeATSFit(resumeId, jobId, userId);
      const atsPayload = serializeATSResultForStorage(atsResult);

      // Safe merge: preserve all existing application_data keys
      const mergedData = {
        ...existingApplicationData,
        ...atsPayload, // adds/overwrites only 'ats_analysis' key
      };

      // Write merged result back to job_applications.application_data
      const { error } = await supabase
        .from('job_applications')
        .update({ application_data: mergedData })
        .eq('id', applicationId);

      if (error) {
        console.error('[ATS] Failed to persist analysis:', error.message);
        return { persisted: false, score: null };
      }

      const score = 'score' in atsResult ? atsResult.score : null;
      return { persisted: true, score };

    } catch (err) {
      // Never propagate — ATS analysis is background enrichment, not a blocker
      console.error('[ATS] Analysis error (non-blocking):', err);
      return { persisted: false, score: null };
    }
  };
};