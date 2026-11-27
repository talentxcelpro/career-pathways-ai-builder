-- M3: Add content_updated_at column and trigger (updates only on title, description, salary, or location changes)
BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS content_updated_at timestamptz;

CREATE TEMP TABLE _m3_before AS
SELECT
  count(*) AS total_rows,
  count(*) FILTER (WHERE content_updated_at IS NOT NULL) AS before_non_null
FROM public.jobs;

UPDATE public.jobs
SET content_updated_at = coalesce(updated_at, now())
WHERE content_updated_at IS NULL;

CREATE OR REPLACE FUNCTION public.update_job_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.content_updated_at IS NULL THEN
      NEW.content_updated_at := coalesce(NEW.updated_at, now());
    END IF;
    RETURN NEW;
  END IF;

  IF (
    OLD.title IS DISTINCT FROM NEW.title
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.salary_min IS DISTINCT FROM NEW.salary_min
    OR OLD.salary_max IS DISTINCT FROM NEW.salary_max
    OR OLD.salary_currency IS DISTINCT FROM NEW.salary_currency
    OR OLD.salary_range IS DISTINCT FROM NEW.salary_range
    OR OLD.base_salary_currency IS DISTINCT FROM NEW.base_salary_currency
    OR OLD.salary_frequency IS DISTINCT FROM NEW.salary_frequency
    OR OLD.salary_unit IS DISTINCT FROM NEW.salary_unit
    OR OLD.location IS DISTINCT FROM NEW.location
    OR OLD.location_city IS DISTINCT FROM NEW.location_city
    OR OLD.location_state IS DISTINCT FROM NEW.location_state
    OR OLD.location_type IS DISTINCT FROM NEW.location_type
    OR OLD.job_location_type IS DISTINCT FROM NEW.job_location_type
  ) THEN
    NEW.content_updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_content_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_content_updated_at
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_content_updated_at();

SELECT
  b.total_rows,
  b.before_non_null,
  count(*) FILTER (WHERE j.content_updated_at IS NOT NULL) AS after_non_null
FROM public.jobs j
CROSS JOIN _m3_before b
GROUP BY b.total_rows, b.before_non_null;

DROP TABLE _m3_before;

COMMIT;
