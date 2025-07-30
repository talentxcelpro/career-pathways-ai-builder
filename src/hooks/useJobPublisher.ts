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
      const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
      
      console.log('🔐 Auth token available:', !!token);
      console.log('🔐 Token length:', token?.length || 0);
      console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('🔐 Apikey available:', !!apikey);
      console.log('🔗 Using direct cloud URL: https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-publisher');
      
      const headers = {
        'Content-Type': 'application/json',
        'apikey': apikey,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      console.log('📋 Request headers:', Object.keys(headers));
      console.log('📋 Headers detail:', headers);
      
      try {
        console.log('🚀 Starting fetch request...');
        
        // Use direct fetch to cloud function (no localhost fallback)
        const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-publisher', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(params)
        });
        
        console.log('📥 Fetch completed!');
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        console.log('📥 Response type:', response.type);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Function call failed:', response.status, response.statusText);
          console.error('❌ Error response body:', errorText);
          throw new Error(`Function call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📥 Function response:', data);
        
        return data;
      } catch (fetchError) {
        console.error('❌ Fetch error caught:', fetchError);
        console.error('❌ Error name:', fetchError.name);
        console.error('❌ Error message:', fetchError.message);
        console.error('❌ Error stack:', fetchError.stack);
        throw fetchError;
      }
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