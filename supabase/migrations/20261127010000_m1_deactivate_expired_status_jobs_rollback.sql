-- Rollback M1: Restore is_active = true for status = 'expired' rows
BEGIN;

UPDATE public.jobs
SET is_active = true
WHERE status = 'expired'
  AND is_active = false;

COMMIT;
