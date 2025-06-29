
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
