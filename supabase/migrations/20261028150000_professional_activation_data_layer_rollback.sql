-- =============================================================================
-- Migration Rollback: 20261028150000_professional_activation_data_layer_rollback.sql
-- Module: TalentXcel Professional Activation Data Layer Rollback
-- Description: Completely and cleanly removes staging tables, functions, and audit logs
--              without touching canonical tables (profiles, auth.users, jobs).
-- =============================================================================

DROP FUNCTION IF EXISTS public.claim_professional_profile(TEXT, UUID, TEXT[], TEXT, TEXT, NUMERIC, TEXT, TEXT);

DROP TABLE IF EXISTS public.claim_audit_log CASCADE;
DROP TABLE IF EXISTS public.imported_professionals CASCADE;
DROP TABLE IF EXISTS public.import_batches CASCADE;
