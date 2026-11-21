
import { supabase } from "@/integrations/supabase/client";

export const incrementJobViews = async (jobId: string) => {
  try {
    // Atomically increment job views via database RPC (zero calls to legacy dropped job_views table)
    await supabase.rpc('increment_job_views', { job_uuid: jobId });
  } catch (err) {
    console.warn('Job view increment non-fatal:', err);
  }
};

export const incrementJobApplications = async (jobId: string) => {
  try {
    // Use a safer approach to increment - get current count and update
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('applications_count')
      .eq('id', jobId)
      .single();

    if (currentJob) {
      const newCount = Math.min((currentJob.applications_count || 0) + 1, 2147483647); // Max int value
      
      const { error } = await supabase
        .from('jobs')
        .update({ 
          applications_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error incrementing job applications:', error);
    throw error;
  }
};
