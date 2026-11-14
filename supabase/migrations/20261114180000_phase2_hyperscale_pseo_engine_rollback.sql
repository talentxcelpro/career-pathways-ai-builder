-- supabase/migrations/20261114180000_phase2_hyperscale_pseo_engine_rollback.sql
-- Rollback for Phase 2: Hyper-Scale pSEO Engine

BEGIN;

DROP MATERIALIZED VIEW IF EXISTS public.mv_eligible_seo_hubs CASCADE;
DROP TABLE IF EXISTS public.seo_hub_state CASCADE;
DROP TABLE IF EXISTS public.indexing_outbox CASCADE;
DROP TABLE IF EXISTS public.job_ingestion_queue CASCADE;
DROP TABLE IF EXISTS public.external_ats_sources CASCADE;
DROP TABLE IF EXISTS public.canonical_roles CASCADE;
DROP TABLE IF EXISTS public.canonical_cities CASCADE;

COMMIT;
