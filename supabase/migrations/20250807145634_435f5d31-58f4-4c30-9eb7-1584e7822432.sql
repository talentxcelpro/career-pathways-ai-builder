-- Create function to increment batch progress
CREATE OR REPLACE FUNCTION increment_batch_progress(
  batch_id TEXT,
  success BOOLEAN DEFAULT TRUE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the batch progress
  UPDATE bulk_upload_batches 
  SET 
    processed_files = processed_files + 1,
    successful_files = CASE WHEN success THEN successful_files + 1 ELSE successful_files END,
    failed_files = CASE WHEN NOT success THEN failed_files + 1 ELSE failed_files END,
    updated_at = NOW()
  WHERE id = batch_id::UUID;
  
  -- Log the progress update
  INSERT INTO bulk_upload_progress_log (
    batch_id,
    action_type,
    details,
    created_at
  ) VALUES (
    batch_id::UUID,
    CASE WHEN success THEN 'file_processed' ELSE 'file_failed' END,
    jsonb_build_object('success', success, 'timestamp', NOW()),
    NOW()
  );
END;
$$;