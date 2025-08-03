import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedJobSource {
  id: string;
  source_name: string;
  base_url: string;
  domain: string;
  source_type: string;
  country: string;
  is_active: boolean;
  priority: number;
  jobs_per_hour: number;
  success_rate: number;
  avg_response_time_ms: number;
  last_successful_scrape?: string;
  consecutive_failures: number;
  scraping_config: any;
  rate_limit_delay_ms: number;
  max_concurrent_requests: number;
  retry_count: number;
  job_categories: string[];
  location_coverage: string[];
  company_types: string[];
  created_at: string;
  updated_at: string;
}

export interface BatchScrapingQueue {
  id: string;
  batch_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source_ids: string[];
  target_job_count: number;
  priority: number;
  jobs_scraped: number;
  jobs_processed: number;
  jobs_validated: number;
  jobs_seo_optimized: number;
  started_at?: string;
  completed_at?: string;
  processing_time_seconds?: number;
  error_count: number;
  results: any;
  error_details: any;
  created_at: string;
  updated_at: string;
}

export interface SystemPerformanceMetrics {
  id: string;
  metric_date: string;
  total_jobs_scraped: number;
  successful_scrapes: number;
  failed_scrapes: number;
  avg_scraping_speed_jobs_per_hour: number;
  high_quality_jobs: number;
  salary_normalized_jobs: number;
  seo_optimized_jobs: number;
  daily_active_users: number;
  job_applications: number;
  page_views: number;
  search_queries: number;
  organic_traffic: number;
  search_rankings: any;
  content_pieces_generated: number;
  created_at: string;
}

// Enhanced Job Sources Management
export const useEnhancedJobSources = () => {
  return useQuery({
    queryKey: ['enhanced-job-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enhanced_job_sources')
        .select('*')
        .order('priority', { ascending: false })
        .order('success_rate', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as EnhancedJobSource[];
    }
  });
};

export const useCreateEnhancedSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: Omit<EnhancedJobSource, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('enhanced_job_sources')
        .insert(source)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-job-sources'] });
      toast.success('Enhanced job source created successfully');
    },
    onError: (error) => {
      console.error('Failed to create enhanced job source:', error);
      toast.error('Failed to create enhanced job source');
    }
  });
};

// High-Volume Batch Scraping
export const useBatchScrapingQueue = () => {
  return useQuery({
    queryKey: ['batch-scraping-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_scraping_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as BatchScrapingQueue[];
    }
  });
};

export const useCreateBatchScraping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: {
      batch_name: string;
      source_ids: string[];
      target_job_count: number;
      priority?: number;
    }) => {
      const { data, error } = await supabase
        .from('batch_scraping_queue')
        .insert(batch)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-scraping-queue'] });
      toast.success('Batch scraping job created successfully');
    },
    onError: (error) => {
      console.error('Failed to create batch scraping job:', error);
      toast.error('Failed to create batch scraping job');
    }
  });
};

// High-Volume Scraping Execution
export const useExecuteHighVolumeScraping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      batchId: string;
      targetJobCount: number;
      enableAISalaryNormalization?: boolean;
      enableSEOOptimization?: boolean;
    }) => {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/high-volume-job-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batch-scraping-queue'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['system-performance'] });
      
      toast.success(`High-volume scraping started! Target: ${data.targetJobCount} jobs`);
    },
    onError: (error) => {
      console.error('High-volume scraping failed:', error);
      toast.error(`High-volume scraping failed: ${error.message}`);
    }
  });
};

// AI Salary Normalization
export const useAISalaryNormalization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      jobIds?: string[];
      batchSize?: number;
      enableQualityValidation?: boolean;
    }) => {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-salary-normalizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['salary-validations'] });
      
      toast.success(`Salary normalization completed! ${data.processedJobs} jobs updated`);
    },
    onError: (error) => {
      console.error('AI salary normalization failed:', error);
      toast.error(`Salary normalization failed: ${error.message}`);
    }
  });
};

// Advanced SEO Automation
export const useBulkSEOOptimization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contentType: 'job_pages' | 'location_pages' | 'skill_pages' | 'company_pages';
      batchSize?: number;
      generateStructuredData?: boolean;
      createLandingPages?: boolean;
    }) => {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bulk-seo-optimizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seo-content-automation'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-landing-pages'] });
      
      toast.success(`SEO optimization completed! ${data.optimizedCount} items processed`);
    },
    onError: (error) => {
      console.error('Bulk SEO optimization failed:', error);
      toast.error(`SEO optimization failed: ${error.message}`);
    }
  });
};

// System Performance Monitoring
export const useSystemPerformanceMetrics = (days = 7) => {
  return useQuery({
    queryKey: ['system-performance', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_performance_metrics')
        .select('*')
        .gte('metric_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as SystemPerformanceMetrics[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};

// Market Insights for Content Marketing
export const useGenerateMarketInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      insightType: 'salary_trends' | 'skill_demand' | 'location_hotspots' | 'industry_growth';
      location?: string;
      industry?: string;
      skillCategory?: string;
      timeRange?: 'week' | 'month' | 'quarter' | 'year';
    }) => {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/market-insights-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-insights'] });
      
      toast.success(`Market insights generated! ${data.insightsCount} insights created`);
    },
    onError: (error) => {
      console.error('Market insights generation failed:', error);
      toast.error(`Market insights generation failed: ${error.message}`);
    }
  });
};

// Initialize default sources for rapid scaling
export const useInitializeDefaultSources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/initialize-default-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-job-sources'] });
      
      toast.success(`Initialized ${data.sourcesCreated} enhanced job sources for high-volume scraping!`);
    },
    onError: (error) => {
      console.error('Default sources initialization failed:', error);
      toast.error(`Default sources initialization failed: ${error.message}`);
    }
  });
};