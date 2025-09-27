import { getSupabaseFunctions } from '@/integrations/supabase/client';
import { newJobsData } from './bulkJobData';

export const uploadNewJobs = async () => {
  try {
    console.log('Starting bulk job upload...');
    
    const supabase = getSupabaseFunctions();
    
    const { data, error } = await supabase.functions.invoke('bulk-job-upload-v2', {
      body: {
        csvData: newJobsData,
        batchName: 'TalentXcel Jobs Batch 2 - Fresher Positions'
      }
    });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);
    return data;
  } catch (error) {
    console.error('Failed to upload jobs:', error);
    throw error;
  }
};

// Call this function to upload the jobs
export const executeJobUpload = async () => {
  try {
    const result = await uploadNewJobs();
    console.log(`Successfully uploaded ${result?.successfulJobs || 0} jobs out of ${result?.totalJobs || 0}`);
    
    if (result?.errors && result.errors.length > 0) {
      console.warn('Upload errors:', result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('Job upload failed:', error);
    return null;
  }
};