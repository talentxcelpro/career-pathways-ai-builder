import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLinkedInImportStats = () => {
  return useQuery({
    queryKey: ['linkedin-import-stats'],
    queryFn: async () => {
      const [
        { count: totalProfiles },
        { count: todayImports },
        { count: pendingJobs },
        { data: recentImports },
        { data: batchStats }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('linkedin_import_jobs').select('status').order('created_at', { ascending: false }).limit(100)
      ]);

      // Calculate success rate from actual data
      const successCount = batchStats?.filter(job => job.status === 'completed').length || 0;
      const totalCount = batchStats?.length || 1;
      const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 94.5;

      return {
        totalProfiles: totalProfiles || 0,
        todayImports: todayImports || 0,
        pendingJobs: pendingJobs || 0,
        successRate,
        recentImports: recentImports || []
      };
    }
  });
};

export const useLinkedInJobScraping = () => {
  return useQuery({
    queryKey: ['linkedin-job-scraping'],
    queryFn: async () => {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, created_at, external_url, is_active')
        .not('external_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const scrapedJobs = jobs?.filter(job => job.external_url?.includes('linkedin.com')) || [];
      
      return {
        totalScraped: scrapedJobs.length,
        activeJobs: scrapedJobs.filter(job => job.is_active).length,
        recentJobs: scrapedJobs.slice(0, 10)
      };
    }
  });
};