-- Fix the increment_batch_progress function to use correct column names
CREATE OR REPLACE FUNCTION increment_batch_progress(
  batch_id TEXT,
  success BOOLEAN DEFAULT TRUE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the batch progress with correct column names
  UPDATE bulk_upload_batches 
  SET 
    processed_jobs = processed_jobs + 1,
    failed_jobs = CASE WHEN NOT success THEN failed_jobs + 1 ELSE failed_jobs END,
    processing_status = 'processing',
    updated_at = NOW()
  WHERE id = batch_id::UUID;
  
  -- Check if all files have been processed and update status
  UPDATE bulk_upload_batches
  SET 
    processing_status = CASE 
      WHEN processed_jobs >= total_files THEN 'completed'
      ELSE 'processing'
    END,
    completed_at = CASE 
      WHEN processed_jobs >= total_files THEN NOW()
      ELSE completed_at
    END
  WHERE id = batch_id::UUID;
END;
$$;