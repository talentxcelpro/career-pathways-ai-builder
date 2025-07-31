-- Auto-expiry and duplicate protection for jobs
DO $$
BEGIN
    -- Add status column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='jobs' AND column_name='status'
    ) THEN
        ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END$$;

-- Add unique constraint to prevent duplicates
DO $$
BEGIN
    BEGIN
        ALTER TABLE jobs
        ADD CONSTRAINT unique_job_entry UNIQUE (job_title, company_name, location);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
    END;
END$$;

-- Create function to auto-expire jobs after 10 days
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE jobs
    SET status = 'expired',
        updated_at = now()
    WHERE posted_at <= now() - INTERVAL '10 days'
      AND status = 'active';
END;
$$;

-- Schedule daily auto-expiry using pg_cron
SELECT cron.schedule(
    'expire-old-jobs',
    '0 2 * * *', -- Every day at 2 AM
    'SELECT expire_old_jobs();'
);