-- Rollback: 20261124220000_talentxcel_global_growth_network_engine_rollback.sql

DROP FUNCTION IF EXISTS public.attribute_growth_referral(TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

DROP TABLE IF EXISTS public.growth_intelligence_snapshots CASCADE;
DROP TABLE IF EXISTS public.growth_distribution_ledger CASCADE;
DROP TABLE IF EXISTS public.growth_referral_attributions CASCADE;
DROP TABLE IF EXISTS public.growth_inventory_readiness CASCADE;
DROP TABLE IF EXISTS public.growth_geo_cities CASCADE;
