import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobScrapingSource {
  id: string;
  source_name: string;
  base_url: string;
  scraping_config: any;
  search_keywords?: string[];
  location_filters?: string[];
  is_active: boolean;
  last_scraped_at?: string;
  scraping_frequency: string;
  jobs_scraped_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BotScrapingAssignment {
  id: string;
  bot_id: string;
  source_id: string;
  keywords: string[];
  location_preferences: string[];
  max_jobs_per_scrape: number;
  is_active: boolean;
  created_at: string;
}

export const useJobScrapingSources = () => {
  return useQuery({
    queryKey: ['job-scraping-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_scraping_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as JobScrapingSource[];
    }
  });
};

export const useBotScrapingAssignments = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-scraping-assignments', botId],
    queryFn: async () => {
      let query = supabase
        .from('bot_scraping_assignments')
        .select(`
          *,
          job_scraping_sources!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as (BotScrapingAssignment & { job_scraping_sources: JobScrapingSource })[];
    }
  });
};

export const useCreateScrapingSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: Omit<JobScrapingSource, 'id' | 'created_at' | 'updated_at' | 'jobs_scraped_count' | 'success_rate' | 'last_scraped_at'>) => {
      const { data, error } = await supabase
        .from('job_scraping_sources')
        .insert(source)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-scraping-sources'] });
      toast.success('Scraping source created successfully');
    },
    onError: (error) => {
      console.error('Failed to create scraping source:', error);
      toast.error('Failed to create scraping source');
    }
  });
};

export const useUpdateScrapingSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<JobScrapingSource> }) => {
      const { data, error } = await supabase
        .from('job_scraping_sources')
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
      queryClient.invalidateQueries({ queryKey: ['job-scraping-sources'] });
      toast.success('Scraping source updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update scraping source:', error);
      toast.error('Failed to update scraping source');
    }
  });
};

export const useCreateBotAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<BotScrapingAssignment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('bot_scraping_assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-scraping-assignments'] });
      toast.success('Bot assignment created successfully');
    },
    onError: (error) => {
      console.error('Failed to create bot assignment:', error);
      toast.error('Failed to create bot assignment');
    }
  });
};

export const useDeleteBotAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bot_scraping_assignments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-scraping-assignments'] });
      toast.success('Bot assignment deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete bot assignment:', error);
      toast.error('Failed to delete bot assignment');
    }
  });
};