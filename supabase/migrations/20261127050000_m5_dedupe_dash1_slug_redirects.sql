-- M5 (Revised): Deduplicate ONLY true same-job base/-1 pairs
-- (matching apply URL, external_id, description hash, title, company_name, location).
-- Pairs with differing description/posting stay live as-is.
BEGIN;

CREATE TABLE IF NOT EXISTS public.job_slug_redirects (
  from_slug text PRIMARY KEY,
  to_slug text NOT NULL,
  source_job_id uuid,
  target_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for job_slug_redirects" ON public.job_slug_redirects;
CREATE POLICY "Public read access for job_slug_redirects"
  ON public.job_slug_redirects
  FOR SELECT
  USING (true);

GRANT SELECT ON public.job_slug_redirects TO anon, authenticated, service_role;

CREATE TEMP TABLE _m5_pairs AS
SELECT
  d.id AS dash1_id,
  d.seo_slug AS from_slug,
  b.id AS base_id,
  b.seo_slug AS to_slug,
  (
    coalesce(d.external_url, d.apply_url, '') = coalesce(b.external_url, b.apply_url, '')
    AND coalesce(d.external_id, '') = coalesce(b.external_id, '')
    AND md5(coalesce(d.description, '')) = md5(coalesce(b.description, ''))
    AND coalesce(d.title, '') = coalesce(b.title, '')
    AND coalesce(d.company_name, '') = coalesce(b.company_name, '')
    AND coalesce(d.location, '') = coalesce(b.location, '')
  ) AS is_exact_same_job
FROM public.jobs d
JOIN public.jobs b
  ON b.seo_slug = left(d.seo_slug, length(d.seo_slug) - 2)
WHERE d.seo_slug LIKE '%-1';

INSERT INTO public.job_slug_redirects (from_slug, to_slug, source_job_id, target_job_id)
SELECT from_slug, to_slug, dash1_id, base_id
FROM _m5_pairs
WHERE is_exact_same_job = true
ON CONFLICT (from_slug) DO NOTHING;

UPDATE public.jobs j
SET is_active = false
FROM _m5_pairs p
WHERE p.is_exact_same_job = true
  AND j.id = p.dash1_id
  AND j.is_active = true;

SELECT
  count(*) AS total_base_dash1_pairs,
  count(*) FILTER (WHERE is_exact_same_job) AS same_job_slug_flip,
  count(*) FILTER (WHERE NOT is_exact_same_job) AS different_postings_kept_as_is
FROM _m5_pairs;

DROP TABLE _m5_pairs;

COMMIT;
