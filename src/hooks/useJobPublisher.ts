import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePublishScrapedJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      botId?: string;
      maxJobs?: number;
      autoPublish?: boolean;
    }) => {
      console.log('📤 Sending to job-publisher:', JSON.stringify(params, null, 2));
      console.log('Calling job-publisher function...');
      const { data, error } = await supabase.functions.invoke('job-publisher', {
        body: params
      });

      console.log('Job-publisher response:', { data, error });
      if (error) {
        console.error('Job publisher error details:', {
          message: error.message,
          details: error,
          url: 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-publisher'
        });
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      toast.success(`Successfully published ${data.published} jobs`);
    },
    onError: (error) => {
      console.error('Job publishing failed:', error);
      toast.error('Job publishing failed');
    }
  });
};

export const useTriggerDailyJobScraping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get all active scraping sources
      const { data: sources, error: sourcesError } = await supabase
        .from('job_scraping_sources')
        .select('*')
        .eq('is_active', true);

      if (sourcesError) {
        throw new Error(sourcesError.message);
      }

      // Get Raj and Shelly bots
      const { data: bots, error: botsError } = await supabase
        .from('ai_bots')
        .select('id, name, email')
        .in('email', ['raj@talentxcel.in', 'shelly@talentxcel.in'])
        .eq('is_active', true);

      if (botsError) {
        throw new Error(botsError.message);
      }

      const results = [];
      let totalJobs = 0;

      // Calculate jobs per source to reach 10,000 total
      const targetJobs = 10000;
      const jobsPerSource = Math.ceil(targetJobs / sources.length);

      for (const source of sources) {
        // Determine if this is an Indian source (60%) or Global (40%)
        const config = source.scraping_config as any;
        const isIndian = config?.country === 'India';
        const maxJobsForSource = isIndian ? 
          Math.floor(jobsPerSource * 0.6) : 
          Math.floor(jobsPerSource * 0.4);

        // Alternate between Raj and Shelly
        const botId = totalJobs % 2 === 0 ? 
          bots.find(b => b.email === 'raj@talentxcel.in')?.id :
          bots.find(b => b.email === 'shelly@talentxcel.in')?.id;

        try {
          console.log(`Calling job-scraper function for ${source.source_name}...`);
          const { data, error } = await supabase.functions.invoke('job-scraper', {
            body: {
              sourceId: source.id,
              botId,
              maxJobs: maxJobsForSource,
              keywords: source.search_keywords || []
            }
          });

          console.log(`Job-scraper response for ${source.source_name}:`, { data, error });
          if (error) {
            console.error(`Job scraper error for ${source.source_name}:`, {
              message: error.message,
              details: error,
              url: `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-scraper`
            });
            continue;
          }

          results.push({
            source: source.source_name,
            jobsScraped: data.jobsScraped,
            bot: bots.find(b => b.id === botId)?.name
          });

          totalJobs += data.jobsScraped;
        } catch (error) {
          console.error(`Error scraping ${source.source_name}:`, error);
        }
      }

      return {
        totalJobs,
        results,
        targetReached: totalJobs >= targetJobs
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      toast.success(`Daily scraping completed! Scraped ${data.totalJobs} jobs`);
    },
    onError: (error) => {
      console.error('Daily scraping failed:', error);
      toast.error('Daily scraping failed');
    }
  });
};