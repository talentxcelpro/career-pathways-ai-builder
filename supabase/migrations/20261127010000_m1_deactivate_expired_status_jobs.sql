-- M1: Set is_active = false where status = 'expired' (keep all rows and URLs)
-- PREREQUISITE: 20261127005000_m0_guard_update_job_seo_data_trigger.sql MUST run first.
BEGIN;

CREATE TEMP TABLE _m1_counts AS
SELECT
  count(*) AS total_rows,
  count(*) FILTER (WHERE is_active = true) AS before_is_active_true,
  count(*) FILTER (WHERE status = 'expired' AND is_active = true) AS before_expired_still_active
FROM public.jobs;

UPDATE public.jobs
SET is_active = false
WHERE status = 'expired'
  AND is_active = true;

SELECT
  c.total_rows,
  c.before_is_active_true,
  c.before_expired_still_active,
  count(*) FILTER (WHERE j.is_active = true) AS after_is_active_true,
  count(*) FILTER (WHERE j.status = 'expired' AND j.is_active = true) AS after_expired_still_active
FROM public.jobs j
CROSS JOIN _m1_counts c
GROUP BY c.total_rows, c.before_is_active_true, c.before_expired_still_active;

DROP TABLE _m1_counts;

COMMIT;
