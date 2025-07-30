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
      
      // Get current session and token for debugging
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      console.log('🔐 Auth token available:', !!token);
      console.log('🔐 Token length:', token?.length || 0);
      
      console.log('🔗 Calling function URL: https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-publisher');
      console.log('Calling job-publisher function...');
      
      // TEMPORARY: Direct fetch to bypass any local development overrides
      try {
        console.log('🧪 Testing direct fetch to cloud function...');
        const directResponse = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-publisher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          },
          body: JSON.stringify(params)
        });
        
        const directResponseText = await directResponse.text();
        console.log('🧪 Direct fetch status:', directResponse.status);
        console.log('🧪 Direct fetch response:', directResponseText);
        
        if (directResponse.ok) {
          const directData = JSON.parse(directResponseText);
          console.log('✅ Direct fetch worked! Using direct response.');
          return directData;
        }
      } catch (directError) {
        console.error('❌ Direct fetch failed:', directError);
      }
      
      // Fallback to supabase client
      const { data, error } = await supabase.functions.invoke('job-publisher', {
        body: params
      });

      console.log('📥 Job-publisher supabase client response:', { data, error });
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