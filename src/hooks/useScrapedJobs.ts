import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScrapedJob {
  id: string;
  bot_id: string;
  job_title: string;
  company: string;
  location: string;
  salary?: string;
  job_description: string;
  source_url: string;
  source_platform: string;
  posted_at?: string;
  scraped_at: string;
  status: string;
  seo_keywords?: string[];
  enhanced_description?: string;
  enhanced_title?: string;
  processing_status: string;
  error_message?: string;
  published_job_id?: string;
  created_at: string;
  updated_at: string;
}

export const useScrapedJobs = (botId?: string, status?: string) => {
  return useQuery({
    queryKey: ['scraped-jobs', botId, status],
    queryFn: async () => {
      let query = supabase
        .from('scraped_jobs')
        .select(`
          *,
          ai_bots!inner(name, email)
        `)
        .order('scraped_at', { ascending: false });

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as ScrapedJob[];
    }
  });
};

export const useTriggerJobScraping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sourceId: string;
      botId: string;
      maxJobs?: number;
      keywords?: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke('job-scraper', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      toast.success('Job scraping completed successfully');
    },
    onError: (error) => {
      console.error('Job scraping failed:', error);
      toast.error('Job scraping failed');
    }
  });
};

export const useEnhanceScrapedJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      botId: string;
      sourceJobId: string;
      autoPublish?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('enhanced-content-generator', {
        body: {
          ...params,
          contentType: 'job'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['bot-generated-content'] });
      toast.success('Job enhanced successfully');
    },
    onError: (error) => {
      console.error('Job enhancement failed:', error);
      toast.error('Job enhancement failed');
    }
  });
};

export const useUpdateScrapedJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<ScrapedJob> }) => {
      const { data, error } = await supabase
        .from('scraped_jobs')
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
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error) => {
      console.error('Job update failed:', error);
      toast.error('Job update failed');
    }
  });
};

export const useDeleteScrapedJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scraped_jobs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      console.error('Job deletion failed:', error);
      toast.error('Job deletion failed');
    }
  });
};