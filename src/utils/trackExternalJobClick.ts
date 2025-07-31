import { supabase } from "@/integrations/supabase/client";

export const trackExternalJobClick = async (jobId: string, externalUrl: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found for tracking external job click');
      return;
    }

    const { error } = await supabase
      .from('job_click_logs')
      .insert({
        user_id: user.id,
        job_id: jobId,
        external_url: externalUrl,
        clicked_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking external job click:', error);
    } else {
      console.log('External job click tracked successfully');
    }
  } catch (error) {
    console.error('Failed to track external job click:', error);
  }
};