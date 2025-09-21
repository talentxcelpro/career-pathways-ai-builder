import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeProgress {
  job_id: string;
  status: string;
  progress_percentage: number;
  jobs_found: number;
  error_message?: string;
}

export const useLinkedInRealTime = () => {
  const [scrapingProgress, setScrapingProgress] = useState<Record<string, RealTimeProgress>>({});
  const [importProgress, setImportProgress] = useState<Record<string, any>>({});
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to LinkedIn scraping jobs real-time updates
    const scrapingChannel = supabase
      .channel('linkedin-scraping-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linkedin_scraping_jobs'
        },
        (payload) => {
          console.log('Scraping job update:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const job = payload.new as any;
            setScrapingProgress(prev => ({
              ...prev,
              [job.id]: {
                job_id: job.id,
                status: job.status,
                progress_percentage: job.progress_percentage || 0,
                jobs_found: job.jobs_found || 0,
                error_message: job.error_message
              }
            }));

            // Show toast notifications for status changes
            if (payload.eventType === 'UPDATE' && payload.old.status !== job.status) {
              if (job.status === 'completed') {
                toast({
                  title: "Scraping Completed!",
                  description: `Found ${job.jobs_found} jobs`,
                });
              } else if (job.status === 'failed') {
                toast({
                  title: "Scraping Failed",
                  description: job.error_message || "Unknown error occurred",
                  variant: "destructive"
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to LinkedIn import jobs real-time updates
    const importChannel = supabase
      .channel('linkedin-import-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linkedin_import_jobs'
        },
        (payload) => {
          console.log('Import job update:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const job = payload.new as any;
            setImportProgress(prev => ({
              ...prev,
              [job.id]: job
            }));

            // Show notifications for import completions
            if (payload.eventType === 'UPDATE' && payload.old.status !== job.status) {
              if (job.status === 'completed') {
                toast({
                  title: "Import Completed!",
                  description: "LinkedIn profile imported successfully",
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to profiles updates for live metrics
    const profilesChannel = supabase
      .channel('profiles-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('New profile added:', payload);
          // Update live metrics when new profiles are added
          updateLiveMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scrapingChannel);
      supabase.removeChannel(importChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [toast]);

  const updateLiveMetrics = async () => {
    try {
      const [
        { count: totalProfiles },
        { count: todayImports },
        { count: activeJobs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('linkedin_scraping_jobs').select('*', { count: 'exact', head: true })
          .eq('status', 'running')
      ]);

      setLiveMetrics({
        totalProfiles: totalProfiles || 0,
        todayImports: todayImports || 0,
        activeJobs: activeJobs || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating live metrics:', error);
    }
  };

  // Initialize live metrics
  useEffect(() => {
    updateLiveMetrics();
  }, []);

  return {
    scrapingProgress,
    importProgress,
    liveMetrics,
    updateLiveMetrics
  };
};