-- Add missing columns to bulk_upload_batches table
ALTER TABLE public.bulk_upload_batches 
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS total_files integer DEFAULT 0;

-- Update existing records to have consistent column names
UPDATE public.bulk_upload_batches 
SET processing_status = status,
    total_files = COALESCE(total_jobs, 0)
WHERE processing_status IS NULL;