
import { supabase } from "@/integrations/supabase/client";

export const incrementJobViews = async (jobId: string) => {
  const { error } = await supabase.rpc('increment_job_views', { job_id: jobId });
  if (error) throw error;
};

export const incrementJobApplications = async (jobId: string) => {
  const { error } = await supabase.rpc('increment_job_applications', { job_id: jobId });
  if (error) throw error;
};
