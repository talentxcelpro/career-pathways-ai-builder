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

    // Enhanced tracking with user agent and source page
    const { error } = await supabase
      .from('external_job_redirects')
      .insert({
        user_id: user.id,
        job_id: jobId,
        external_url: externalUrl,
        source_page: sourcePage,
        user_agent: navigator.userAgent,
        redirected_at: new Date().toISOString()
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