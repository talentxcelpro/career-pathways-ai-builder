import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobPortalBlocklist {
  id: string;
  domain: string;
  portal_type: string;
  reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobSourceValidation {
  id: string;
  source_url: string;
  domain: string;
  validation_result: 'company_website' | 'job_portal' | 'unknown';
  confidence_score: number;
  ai_reasoning?: string;
  validated_at: string;
}

export interface JobQualityScore {
  id: string;
  job_id: string;
  overall_score: number;
  completeness_score: number;
  relevance_score: number;
  freshness_score: number;
  source_trust_score: number;
  ai_assessment: any;
  created_at: string;
}

export interface ScrapingSchedule {
  id: string;
  bot_id: string;
  source_category: string;
  target_urls: string[];
  scraping_frequency: string;
  max_jobs_per_run: number;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  success_count: number;
  error_count: number;
  created_at: string;
}

export const useJobPortalBlocklist = () => {
  return useQuery({
    queryKey: ['job-portal-blocklist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_portal_blocklist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as JobPortalBlocklist[];
    }
  });
};

export const useJobSourceValidations = (limit = 50) => {
  return useQuery({
    queryKey: ['job-source-validations', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_source_validations')
        .select('*')
        .order('validated_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data as JobSourceValidation[];
    }
  });
};

export const useJobQualityScores = (jobId?: string) => {
  return useQuery({
    queryKey: ['job-quality-scores', jobId],
    queryFn: async () => {
      let query = supabase
        .from('job_quality_scores')
        .select(`
          *,
          scraped_jobs!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        throw new Error(error.message);
      }

      return data as JobQualityScore[];
    }
  });
};

export const useScrapingSchedules = (botId?: string) => {
  return useQuery({
    queryKey: ['scraping-schedules', botId],
    queryFn: async () => {
      let query = supabase
        .from('scraping_schedules')
        .select(`
          *,
          ai_bots!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as ScrapingSchedule[];
    }
  });
};

export const useSmartJobScraping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sourceUrls: string[];
      botId: string;
      maxJobs?: number;
      testMode?: boolean;
      sourceCategory?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('job-scraper', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-source-validations'] });
      queryClient.invalidateQueries({ queryKey: ['job-quality-scores'] });
      
      if (data.testMode) {
        toast.success(`Test completed: Found ${data.jobsScraped} potential jobs`);
      } else {
        toast.success(`Successfully scraped ${data.jobsScraped} jobs`);
      }
    },
    onError: (error) => {
      console.error('Smart job scraping failed:', error);
      toast.error('Job scraping failed');
    }
  });
};

export const useAutomatedJobProcessor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('automated-job-processor', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast.success(`Automation complete: ${data.results.totalJobsScraped} jobs processed`);
    },
    onError: (error) => {
      console.error('Automated job processing failed:', error);
      toast.error('Automated job processing failed');
    }
  });
};

export const useCreateScrapingSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bot_id: string;
      source_category: string;
      target_urls: string[];
      scraping_frequency: string;
      max_jobs_per_run: number;
    }) => {
      const { data, error } = await supabase
        .from('scraping_schedules')
        .insert(params)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-schedules'] });
      toast.success('Scraping schedule created successfully');
    },
    onError: (error) => {
      console.error('Failed to create scraping schedule:', error);
      toast.error('Failed to create scraping schedule');
    }
  });
};

export const useUpdateScrapingSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<ScrapingSchedule> }) => {
      const { data, error } = await supabase
        .from('scraping_schedules')
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-schedules'] });
      toast.success('Scraping schedule updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update scraping schedule:', error);
      toast.error('Failed to update scraping schedule');
    }
  });
};

export const useAddToBlocklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      domain: string;
      portal_type: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_portal_blocklist')
        .insert(params)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-portal-blocklist'] });
      toast.success('Domain added to blocklist');
    },
    onError: (error) => {
      console.error('Failed to add domain to blocklist:', error);
      toast.error('Failed to add domain to blocklist');
    }
  });
};

export const useRemoveFromBlocklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_portal_blocklist')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-portal-blocklist'] });
      toast.success('Domain removed from blocklist');
    },
    onError: (error) => {
      console.error('Failed to remove domain from blocklist:', error);
      toast.error('Failed to remove domain from blocklist');
    }
  });
};