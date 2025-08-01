import { supabase } from "@/integrations/supabase/client";

export const trackExternalJobClick = async (
  jobId: string, 
  externalUrl: string, 
  sourcePage: string = 'application_success'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found for tracking external job click');
      return;
    }

    // Use RPC for tracking since table types aren't loaded yet
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
    } else {
      console.log(`🔗 External redirect tracked: ${jobId} → ${externalUrl}`);
    }
  } catch (error) {
    console.error('Failed to track external job redirect:', error);
  }
};