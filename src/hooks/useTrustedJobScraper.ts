import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrustedJobScrapingParams {
  job_url: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  salary_range?: string;
  posted_date: string;
  employment_type?: string;
  experience_level?: string;
  source: string;
}

export const useTrustedJobScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TrustedJobScrapingParams) => {
      const { data, error } = await supabase.functions.invoke('trusted-job-scraper', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraped-jobs'] });
      
      if (data.success) {
        toast.success(`Job scraped successfully! Skills extracted: ${data.skills_extracted}`);
      } else {
        toast.warning(data.message || 'Job processing completed with warnings');
      }
    },
    onError: (error) => {
      console.error('Trusted job scraping failed:', error);
      toast.error(`Job scraping failed: ${error.message}`);
    }
  });
};

export const useJobExpiryCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('job-expiry-cleanup');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      if (data.success) {
        toast.success(`Cleanup completed! ${data.expired_count} expired jobs processed`);
      }
    },
    onError: (error) => {
      console.error('Job cleanup failed:', error);
      toast.error(`Job cleanup failed: ${error.message}`);
    }
  });
};

export const useScraperLogs = (filters?: { source?: string; status?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['scraper-logs', filters],
    queryFn: async () => {
      const query = supabase
        .from('scraper_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  });
};

// Utility function to validate trusted domains
export const TRUSTED_DOMAINS = [
  // Job portals
  'naukri.com', 'indeed.com', 'foundit.in', 'instahyre.com', 'angel.co',
  'cutshort.io', 'shine.com', 'glassdoor.com', 'linkedin.com', 'timesjobs.com',
  'hiringplug.com', 'workindia.in', 'jobhai.com', 'monsterindia.com', 'apna.co',
  'internshala.com', 'unstop.com', 'hireclap.com', 'talent500.co', 'relevel.com',
  'remoteok.io', 'weworkremotely.com', 'simplyhired.com',
  // Company career pages - specific subdomains
  'careers.google.com', 'careers.microsoft.com', 'careers.accenture.com',
  'jobs.tcs.com', 'careers.cognizant.com', 'jobs.sap.com', 'jobs.ibm.com',
  'careers.infosys.com', 'careers.wipro.com', 'careers.hcltech.com', 
  'careers.techmahindra.com', 'career.infosys.com', 'sjobs.brassring.com', 
  'digitalcareers.infosys.com',
  // Company root domains
  'tcs.com', 'wipro.com', 'hcltech.com', 'accenture.com', 'infosys.com', 
  'techmahindra.com', 'cognizant.com', 'google.com', 'microsoft.com', 
  'sap.com', 'ibm.com'
];

export const isTrustedDomain = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return TRUSTED_DOMAINS.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
};