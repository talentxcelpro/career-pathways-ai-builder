-- Migration: 20261124220000_talentxcel_global_growth_network_engine.sql
-- Description: Core schema for Global Professional Geography, Inventory Readiness, Referral Attribution, Distribution Ledger, and Growth Intelligence.
-- Security: Strict RLS policies, public read on indexable inventory, authenticated/service role writes.

-- 1. GLOBAL PROFESSIONAL GEOGRAPHY
CREATE TABLE IF NOT EXISTS public.growth_geo_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    city_name TEXT NOT NULL,
    state_name TEXT,
    country_name TEXT NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    continent VARCHAR(20) NOT NULL,
    tier SMALLINT NOT NULL DEFAULT 3 CHECK (tier BETWEEN 1 AND 4),
    population_proxy INTEGER DEFAULT 0,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    active_jobs_count INTEGER NOT NULL DEFAULT 0,
    consented_professionals_count INTEGER NOT NULL DEFAULT 0,
    discussions_count INTEGER NOT NULL DEFAULT 0,
    communities_count INTEGER NOT NULL DEFAULT 0,
    demand_search_index NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    registration_conversion_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    priority_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    indexation_gate VARCHAR(20) NOT NULL DEFAULT 'incubating' CHECK (indexation_gate IN ('indexable', 'emerging', 'incubating', 'gated')),
    quality_assessment JSONB DEFAULT '{}'::jsonb,
    last_evaluated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_growth_geo_cities_country_tier ON public.growth_geo_cities (country_code, tier, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_growth_geo_cities_gate ON public.growth_geo_cities (indexation_gate, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_growth_geo_cities_slug ON public.growth_geo_cities (slug);

-- 2. PROFESSIONAL INVENTORY READINESS
CREATE TABLE IF NOT EXISTS public.growth_inventory_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(30) NOT NULL, -- 'city', 'industry', 'skill', 'career_segment'
    entity_slug TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    country_code VARCHAR(3) DEFAULT 'IN',
    consented_professionals_count INTEGER NOT NULL DEFAULT 0,
    active_jobs_count INTEGER NOT NULL DEFAULT 0,
    freshers_internships_count INTEGER NOT NULL DEFAULT 0,
    discussions_count INTEGER NOT NULL DEFAULT 0,
    verified_skills_count INTEGER NOT NULL DEFAULT 0,
    readiness_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    readiness_tier VARCHAR(25) NOT NULL DEFAULT 'GHOST_PROTECTED' CHECK (readiness_tier IN ('HIGH_DENSITY', 'MEDIUM_DENSITY', 'COMMUNITY_INCUBATING', 'GHOST_PROTECTED')),
    is_search_indexable BOOLEAN NOT NULL DEFAULT false,
    canonical_path TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    last_computed_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    CONSTRAINT uq_growth_inventory_entity UNIQUE (entity_type, entity_slug, country_code)
);

CREATE INDEX IF NOT EXISTS idx_growth_inventory_readiness_tier ON public.growth_inventory_readiness (readiness_tier, is_search_indexable);
CREATE INDEX IF NOT EXISTS idx_growth_inventory_canonical_path ON public.growth_inventory_readiness (canonical_path);

-- 3. ORGANIC REFERRAL & INVITATION ATTRIBUTION
CREATE TABLE IF NOT EXISTS public.growth_referral_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) NOT NULL,
    visitor_id TEXT NOT NULL,
    landing_path TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'shortlink',
    campaign VARCHAR(100),
    ip_hash VARCHAR(64),
    user_agent_hash VARCHAR(64),
    converted_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'visited' CHECK (status IN ('visited', 'signed_up', 'profile_completed', 'activated', 'retained')),
    first_activity_type VARCHAR(50),
    first_activity_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_growth_ref_code ON public.growth_referral_attributions (referral_code, status);
CREATE INDEX IF NOT EXISTS idx_growth_ref_visitor ON public.growth_referral_attributions (visitor_id);
CREATE INDEX IF NOT EXISTS idx_growth_ref_referrer ON public.growth_referral_attributions (referrer_id, converted_at);
CREATE INDEX IF NOT EXISTS idx_growth_ref_converted ON public.growth_referral_attributions (converted_user_id);

-- 4. POLICY-COMPLIANT DISTRIBUTION LEDGER
CREATE TABLE IF NOT EXISTS public.growth_distribution_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_hash VARCHAR(64) NOT NULL UNIQUE,
    channel VARCHAR(30) NOT NULL, -- 'telegram', 'whatsapp', 'linkedin', 'devto', 'email', 'pinterest'
    content_type VARCHAR(30) NOT NULL, -- 'job_alert', 'talent_spotlight', 'skill_resource', 'community_discussion'
    target_destination TEXT NOT NULL, -- e.g. '@TalentXcelJobs', 'channel_url', 'newsletter_list'
    title TEXT NOT NULL,
    payload JSONB NOT NULL,
    inventory_reference_id UUID, -- References job or post or profile
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'dispatched', 'verified', 'failed', 'suppressed')),
    dispatched_at TIMESTAMPTZ,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    cost_usd NUMERIC(8,4) NOT NULL DEFAULT 0.0000,
    suppression_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_growth_dist_channel_status ON public.growth_distribution_ledger (channel, status, dispatched_at);
CREATE INDEX IF NOT EXISTS idx_growth_dist_content_hash ON public.growth_distribution_ledger (content_hash);

-- 5. AUTONOMOUS GROWTH INTELLIGENCE SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.growth_intelligence_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_profiles INTEGER NOT NULL DEFAULT 0,
    consented_profiles INTEGER NOT NULL DEFAULT 0,
    total_jobs INTEGER NOT NULL DEFAULT 0,
    active_jobs INTEGER NOT NULL DEFAULT 0,
    total_posts INTEGER NOT NULL DEFAULT 0,
    total_connections INTEGER NOT NULL DEFAULT 0,
    indexable_cities_count INTEGER NOT NULL DEFAULT 0,
    indexable_hubs_count INTEGER NOT NULL DEFAULT 0,
    high_growth_regions JSONB DEFAULT '[]'::jsonb,
    underserved_cities JSONB DEFAULT '[]'::jsonb,
    industry_inventory_gaps JSONB DEFAULT '[]'::jsonb,
    top_converting_pathways JSONB DEFAULT '[]'::jsonb,
    prioritized_next_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    CONSTRAINT uq_growth_snapshot_date UNIQUE (snapshot_date)
);

-- RLS POLICIES
ALTER TABLE public.growth_geo_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_inventory_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_distribution_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_intelligence_snapshots ENABLE ROW LEVEL SECURITY;

-- Public can read indexable geo cities and inventory readiness
CREATE POLICY "Public read indexable growth_geo_cities" ON public.growth_geo_cities
    FOR SELECT USING (indexation_gate IN ('indexable', 'emerging', 'incubating'));

CREATE POLICY "Public read public growth_inventory_readiness" ON public.growth_inventory_readiness
    FOR SELECT USING (is_search_indexable = true OR readiness_tier != 'GHOST_PROTECTED');

-- Referrals: users can view their own referrals; service role can insert/update
CREATE POLICY "Users read own referral attributions" ON public.growth_referral_attributions
    FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = converted_user_id);

CREATE POLICY "Service role full on growth_referral_attributions" ON public.growth_referral_attributions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full on growth_geo_cities" ON public.growth_geo_cities
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full on growth_inventory_readiness" ON public.growth_inventory_readiness
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full on growth_distribution_ledger" ON public.growth_distribution_ledger
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full on growth_intelligence_snapshots" ON public.growth_intelligence_snapshots
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SECURE RPC: attribute_growth_referral
CREATE OR REPLACE FUNCTION public.attribute_growth_referral(
    p_referral_code TEXT,
    p_visitor_id TEXT,
    p_landing_path TEXT,
    p_channel TEXT DEFAULT 'shortlink',
    p_campaign TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referrer_id UUID;
    v_attribution_id UUID;
    v_status TEXT := 'visited';
BEGIN
    IF p_referral_code IS NULL OR trim(p_referral_code) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_REFERRAL_CODE');
    END IF;

    -- Lookup referrer profile
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE UPPER(username) = UPPER(p_referral_code)
       OR UPPER(talentxcel_id) = UPPER(p_referral_code)
       OR id::text = p_referral_code
    LIMIT 1;

    -- If referrer not found in profiles, check user_referrals table
    IF v_referrer_id IS NULL THEN
        SELECT referrer_id INTO v_referrer_id
        FROM public.user_referrals
        WHERE UPPER(referral_code) = UPPER(p_referral_code)
        LIMIT 1;
    END IF;

    -- If user_id is provided, status is signed_up
    IF p_user_id IS NOT NULL THEN
        v_status := 'signed_up';
    END IF;

    -- Prevent self-referral
    IF v_referrer_id IS NOT NULL AND p_user_id IS NOT NULL AND v_referrer_id = p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'SELF_REFERRAL_DISALLOWED');
    END IF;

    INSERT INTO public.growth_referral_attributions (
        referrer_id,
        referral_code,
        visitor_id,
        landing_path,
        channel,
        campaign,
        converted_user_id,
        status,
        converted_at
    )
    VALUES (
        v_referrer_id,
        UPPER(p_referral_code),
        COALESCE(p_visitor_id, gen_random_uuid()::text),
        COALESCE(p_landing_path, '/network'),
        COALESCE(p_channel, 'shortlink'),
        p_campaign,
        p_user_id,
        v_status,
        CASE WHEN p_user_id IS NOT NULL THEN clock_timestamp() ELSE NULL END
    )
    RETURNING id INTO v_attribution_id;

    RETURN jsonb_build_object(
        'success', true,
        'attribution_id', v_attribution_id,
        'referrer_id', v_referrer_id,
        'status', v_status
    );
END;
$$;
