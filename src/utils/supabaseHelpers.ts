
import { supabase } from "@/integrations/supabase/client";

export const incrementJobViews = async (jobId: string) => {
  // Insert a job view record
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error: viewError } = await supabase
    .from('job_views')
    .insert({
      job_id: jobId,
      user_id: user?.id,
      ip_address: null, // Could be populated with actual IP
      user_agent: navigator.userAgent
    });

  if (viewError) {
    console.error('Error inserting job view:', viewError);
  }

  // The trigger will automatically update the jobs.views_count
};

export const incrementJobApplications = async (jobId: string) => {
  const { error } = await supabase.rpc('increment_job_applications' as any, { job_id: jobId });
  if (error) throw error;
};
