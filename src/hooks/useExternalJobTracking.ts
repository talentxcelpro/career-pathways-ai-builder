import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalJobRedirect {
  user_id: string;
  job_id: string;
  external_url: string;
  source_page?: string;
  user_agent?: string;
  redirected_at?: string;
}

export const useExternalJobTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const trackAndRedirect = async (
    jobId: string,
    externalUrl: string,
    sourcePage: string = 'application_success'
  ) => {
    setIsTracking(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found for tracking external job redirect');
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Track the redirect using direct SQL to avoid type issues
      const redirectData: ExternalJobRedirect = {
        user_id: user.id,
        job_id: jobId,
        external_url: externalUrl,
        source_page: sourcePage,
        user_agent: navigator.userAgent,
        redirected_at: new Date().toISOString()
      };

      const { error } = await supabase
        .rpc('track_external_job_redirect', {
          p_user_id: user.id,
          p_job_id: jobId,
          p_external_url: externalUrl,
          p_source_page: sourcePage,
          p_user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking external job redirect:', error);
        // Still redirect even if tracking fails
      } else {
        console.log(`🔗 External redirect tracked: ${jobId} → ${externalUrl}`);
      }

      // Open external URL in new tab
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Failed to track external job redirect:', error);
      // Still redirect even if tracking fails
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsTracking(false);
    }
  };

  const getRedirectAnalytics = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_job_redirect_analytics', { p_job_id: jobId });

      if (error) {
        console.error('Error fetching redirect analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch redirect analytics:', error);
      return null;
    }
  };

  return {
    isTracking,
    trackAndRedirect,
    getRedirectAnalytics
  };
};