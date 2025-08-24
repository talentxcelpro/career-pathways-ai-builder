-- Add missing columns and keep schedule fields in sync
BEGIN;

-- 1) Ensure scheduled_at exists and is populated
ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

ALTER TABLE public.agent_tasks
  ALTER COLUMN scheduled_at SET DEFAULT now();

-- Backfill scheduled_at using run_at when available
UPDATE public.agent_tasks
SET scheduled_at = COALESCE(scheduled_at, run_at, now())
WHERE scheduled_at IS NULL;

-- 2) Ensure output and error columns exist to match function expectations
ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS output jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS error text;

-- 3) Create trigger to keep run_at and scheduled_at in sync
CREATE OR REPLACE FUNCTION public.sync_agent_tasks_schedule()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If only one of the timestamps is provided, mirror it to the other
  IF NEW.scheduled_at IS NULL AND NEW.run_at IS NOT NULL THEN
    NEW.scheduled_at := NEW.run_at;
  END IF;

  IF NEW.run_at IS NULL AND NEW.scheduled_at IS NOT NULL THEN
    NEW.run_at := NEW.scheduled_at;
  END IF;

  -- If both are null, initialize with now()
  IF NEW.scheduled_at IS NULL AND NEW.run_at IS NULL THEN
    NEW.scheduled_at := now();
    NEW.run_at := NEW.scheduled_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_agent_tasks_schedule ON public.agent_tasks;
CREATE TRIGGER trg_sync_agent_tasks_schedule
BEFORE INSERT OR UPDATE ON public.agent_tasks
FOR EACH ROW
EXECUTE FUNCTION public.sync_agent_tasks_schedule();

COMMIT;