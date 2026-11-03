-- ============================================================================
-- Migration: 20261103300000_attribution_growth_intelligence.sql
-- Mission ID: TXC-NOTIFICATIONS-004
-- Title: Engagement-to-Revenue Attribution & Growth Intelligence Engine
-- Platform: TalentXcel (https://talentxcel.in)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Ensure public.company_follows exists
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- ----------------------------------------------------------------------------
-- 1. Notification Attribution Touchpoints Table (Phase 1)
-- Persistent touchpoint tracking across the complete engagement-to-product journey
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    touchpoint_type TEXT NOT NULL CHECK (touchpoint_type IN (
        'generated',
        'delivered',
        'opened',
        'clicked',
        'landing_view',
        'job_view',
        'application_start',
        'application_submit',
        'recruiter_contact',
        'candidate_shortlist',
        'registration_complete',
        'service_purchase'
    )),
    entity_type TEXT,
    entity_id TEXT,
    utm_source TEXT DEFAULT 'talentxcel_notifications',
    utm_medium TEXT DEFAULT 'in_app',
    utm_campaign TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attr_touchpoints_notif_type 
    ON public.notification_attribution_touchpoints(notification_id, touchpoint_type);

CREATE INDEX IF NOT EXISTS idx_attr_touchpoints_user_created 
    ON public.notification_attribution_touchpoints(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attr_touchpoints_session 
    ON public.notification_attribution_touchpoints(session_id);

CREATE INDEX IF NOT EXISTS idx_attr_touchpoints_entity 
    ON public.notification_attribution_touchpoints(entity_type, entity_id);


-- ----------------------------------------------------------------------------
-- 2. Attributed Conversions Table (Phase 1 & Phase 2)
-- Links commercial & product milestone completions to causal notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_attributed_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    touchpoint_id UUID REFERENCES public.notification_attribution_touchpoints(id) ON DELETE SET NULL,
    conversion_event TEXT NOT NULL CHECK (conversion_event IN (
        'registration_completed',
        'job_application_submitted',
        'recruiter_candidate_contacted',
        'company_followed',
        'paid_service_purchased',
        'assessment_purchased',
        'staffing_inquiry_submitted'
    )),
    entity_type TEXT,
    entity_id TEXT,
    attribution_model TEXT NOT NULL DEFAULT 'last_touch' CHECK (attribution_model IN ('last_touch', 'first_touch', 'direct_session', 'linear')),
    attribution_window TEXT NOT NULL DEFAULT '24h' CHECK (attribution_window IN ('1h', '24h', '7d', '30d')),
    is_direct_attribution BOOLEAN NOT NULL DEFAULT true,
    touchpoint_to_conversion_seconds INTEGER DEFAULT 0,
    realized_revenue_inr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_id UUID,
    razorpay_payment_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attr_conversions_user_event 
    ON public.notification_attributed_conversions(user_id, conversion_event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attr_conversions_notif 
    ON public.notification_attributed_conversions(notification_id);

CREATE INDEX IF NOT EXISTS idx_attr_conversions_direct 
    ON public.notification_attributed_conversions(is_direct_attribution, created_at DESC);


-- ----------------------------------------------------------------------------
-- 3. Intelligent Experimentation Framework (Phase 3)
-- Controlled A/B experimentation for notification algorithms, caps & digest modes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    variants JSONB NOT NULL DEFAULT '["control", "variant_a"]'::jsonb,
    layer TEXT NOT NULL DEFAULT 'ranking_layer' CHECK (layer IN ('ranking_layer', 'delivery_layer', 'frequency_layer', 'content_layer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    traffic_allocation_pct INTEGER NOT NULL DEFAULT 100,
    start_date TIMESTAMPTZ DEFAULT now(),
    end_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_experiment_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_key TEXT NOT NULL REFERENCES public.notification_experiments(experiment_key) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variant TEXT NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(experiment_key, user_id)
);

CREATE INDEX IF NOT EXISTS idx_exp_enrollments_lookup 
    ON public.notification_experiment_enrollments(experiment_key, user_id);

-- Seed core controlled experiments
INSERT INTO public.notification_experiments (experiment_key, name, description, variants, layer, is_active)
VALUES 
    ('exp_ordering_v1', 'AI Relevance vs Chronological', 'Compares AI-ranked notifications against chronological ordering', '["chronological_control", "ai_relevance_variant"]'::jsonb, 'ranking_layer', true),
    ('exp_delivery_mode_v1', 'Instant vs Intelligent Digest', 'Compares real-time push against curated daily highlights', '["instant_control", "daily_digest_variant"]'::jsonb, 'delivery_layer', true),
    ('exp_threshold_v1', 'Relevance Match Thresholds', 'Tests 65% vs 80% relevance thresholds for job alert volume and conversion', '["moderate_65_control", "strict_80_variant"]'::jsonb, 'ranking_layer', true),
    ('exp_frequency_cap_v1', 'Frequency Caps and Fatigue', 'Evaluates 4/day vs 8/day vs 12/day maximum notification caps', '["cap_8_control", "cap_4_strict", "cap_12_permissive"]'::jsonb, 'frequency_layer', true),
    ('exp_job_alert_copy_v1', 'Personalized Skills vs Generic Title Copy', 'Tests skill-targeted copy vs generic job opening headlines', '["generic_headline", "personalized_skills"]'::jsonb, 'content_layer', true)
ON CONFLICT (experiment_key) DO UPDATE SET is_active = EXCLUDED.is_active;


-- ----------------------------------------------------------------------------
-- 4. Revenue Attribution Intelligence Table (Phase 4)
-- Connects notifications strictly to realized paid product transactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_revenue_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_category TEXT NOT NULL CHECK (product_category IN (
        'resume_services',
        'career_services',
        'employer_recruitment',
        'staffing_inquiries',
        'training_assessment'
    )),
    product_sku TEXT NOT NULL,
    realized_amount_inr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pipeline_amount_inr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_verified_payment BOOLEAN NOT NULL DEFAULT false,
    payment_reference TEXT,
    conversion_id UUID REFERENCES public.notification_attributed_conversions(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_attr_category_created 
    ON public.notification_revenue_attributions(product_category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_attr_verified 
    ON public.notification_revenue_attributions(is_verified_payment);


-- ----------------------------------------------------------------------------
-- 5. Retention Intelligence & Segment Journeys (Phase 5)
-- Tracks at-risk lifecycle cohorts and powers preference-compliant re-engagement
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_retention_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    segment_type TEXT NOT NULL CHECK (segment_type IN (
        'newly_registered_inactive',
        'dormant_applicant',
        'inactive_hiring_pipeline',
        'dormant_company_publisher',
        'fatigued_dismissal_user'
    )),
    days_inactive INTEGER NOT NULL DEFAULT 0,
    journey_status TEXT NOT NULL DEFAULT 'identified' CHECK (journey_status IN (
        'identified',
        'prompt_scheduled',
        'prompt_sent',
        're_engaged',
        'opted_out',
        'dormant'
    )),
    last_activity_at TIMESTAMPTZ,
    scheduled_reengagement_at TIMESTAMPTZ,
    reengagement_notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    reengaged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, segment_type)
);

CREATE INDEX IF NOT EXISTS idx_retention_segments_status_scheduled 
    ON public.notification_retention_segments(journey_status, scheduled_reengagement_at ASC);


-- ----------------------------------------------------------------------------
-- 6. Deterministic Cohort Evaluation Function (Phase 3)
-- Stable, flicker-free hash-based assignment across browser & backend
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.evaluate_user_experiment_cohort(
    p_user_id UUID,
    p_experiment_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_exp RECORD;
    v_existing_variant TEXT;
    v_variants TEXT[];
    v_hash_val INTEGER;
    v_selected_variant TEXT;
    v_num_variants INTEGER;
BEGIN
    IF p_user_id IS NULL OR p_experiment_key IS NULL THEN
        RETURN 'control';
    END IF;

    -- Check if enrollment already persists
    SELECT variant INTO v_existing_variant
    FROM public.notification_experiment_enrollments
    WHERE experiment_key = p_experiment_key AND user_id = p_user_id;

    IF v_existing_variant IS NOT NULL THEN
        RETURN v_existing_variant;
    END IF;

    -- Fetch experiment details
    SELECT * INTO v_exp
    FROM public.notification_experiments
    WHERE experiment_key = p_experiment_key AND is_active = true;

    IF NOT FOUND THEN
        RETURN 'control';
    END IF;

    -- Extract variant array
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_exp.variants)) INTO v_variants;
    v_num_variants := array_length(v_variants, 1);

    IF v_num_variants IS NULL OR v_num_variants = 0 THEN
        RETURN 'control';
    END IF;

    -- Deterministic MD5 integer hash: mod length
    v_hash_val := abs(('x' || substr(md5(p_user_id::text || ':' || p_experiment_key), 1, 8))::bit(32)::int);
    v_selected_variant := v_variants[(v_hash_val % v_num_variants) + 1];

    -- Store enrollment safely
    INSERT INTO public.notification_experiment_enrollments (
        experiment_key, user_id, variant, enrolled_at
    ) VALUES (
        p_experiment_key, p_user_id, v_selected_variant, now()
    ) ON CONFLICT (experiment_key, user_id) DO NOTHING;

    RETURN v_selected_variant;
EXCEPTION WHEN OTHERS THEN
    RETURN 'control';
END;
$$;


-- ----------------------------------------------------------------------------
-- 7. Attribution Resolution Engine (Phase 1 & Phase 2)
-- Resolves whether a conversion had a direct causal notification touchpoint
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_attributed_conversion(
    p_user_id UUID,
    p_conversion_event TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_revenue_inr DECIMAL DEFAULT 0.00,
    p_attribution_window_interval INTERVAL DEFAULT INTERVAL '24 hours',
    p_payment_id UUID DEFAULT NULL,
    p_razorpay_payment_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_touchpoint RECORD;
    v_conversion_id UUID;
    v_is_direct BOOLEAN := false;
    v_time_delta_sec INTEGER := 0;
    v_notif_id UUID := NULL;
    v_touch_id UUID := NULL;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Look backwards for the most recent clicked or opened notification touchpoint within window
    SELECT id, notification_id, created_at
    INTO v_touchpoint
    FROM public.notification_attribution_touchpoints
    WHERE user_id = p_user_id
      AND touchpoint_type IN ('clicked', 'opened')
      AND created_at >= now() - p_attribution_window_interval
      AND (p_entity_type IS NULL OR entity_type = p_entity_type OR entity_type IS NULL)
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        v_is_direct := true;
        v_notif_id := v_touchpoint.notification_id;
        v_touch_id := v_touchpoint.id;
        v_time_delta_sec := EXTRACT(EPOCH FROM (now() - v_touchpoint.created_at))::INTEGER;
    END IF;

    -- Record in attributed conversions table
    INSERT INTO public.notification_attributed_conversions (
        notification_id,
        user_id,
        touchpoint_id,
        conversion_event,
        entity_type,
        entity_id,
        attribution_model,
        attribution_window,
        is_direct_attribution,
        touchpoint_to_conversion_seconds,
        realized_revenue_inr,
        currency,
        payment_id,
        razorpay_payment_id,
        metadata
    ) VALUES (
        v_notif_id,
        p_user_id,
        v_touch_id,
        p_conversion_event,
        p_entity_type,
        p_entity_id,
        'last_touch',
        CASE 
            WHEN p_attribution_window_interval <= INTERVAL '1 hour' THEN '1h'
            WHEN p_attribution_window_interval <= INTERVAL '24 hours' THEN '24h'
            WHEN p_attribution_window_interval <= INTERVAL '7 days' THEN '7d'
            ELSE '30d'
        END,
        v_is_direct,
        v_time_delta_sec,
        COALESCE(p_revenue_inr, 0.00),
        'INR',
        p_payment_id,
        p_razorpay_payment_id,
        p_metadata
    ) RETURNING id INTO v_conversion_id;

    -- If this conversion carries realized revenue, record in revenue attribution
    IF p_revenue_inr > 0 THEN
        INSERT INTO public.notification_revenue_attributions (
            notification_id,
            user_id,
            product_category,
            product_sku,
            realized_amount_inr,
            pipeline_amount_inr,
            is_verified_payment,
            payment_reference,
            conversion_id,
            metadata
        ) VALUES (
            v_notif_id,
            p_user_id,
            COALESCE(p_metadata->>'product_category', 'career_services'),
            COALESCE(p_metadata->>'sku', 'service_standard'),
            p_revenue_inr,
            0.00,
            (p_razorpay_payment_id IS NOT NULL),
            p_razorpay_payment_id,
            v_conversion_id,
            p_metadata
        );
    END IF;

    RETURN v_conversion_id;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'resolve_attributed_conversion error: %', SQLERRM;
    RETURN NULL;
END;
$$;


-- ----------------------------------------------------------------------------
-- 8. Client RPC: Record Attribution Touchpoint (Phase 1)
-- Enables client app to log landing views, job views & funnel progression
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_attribution_touchpoint(
    p_notification_id UUID,
    p_session_id TEXT,
    p_touchpoint_type TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_touchpoint_id UUID;
BEGIN
    INSERT INTO public.notification_attribution_touchpoints (
        notification_id,
        user_id,
        session_id,
        touchpoint_type,
        entity_type,
        entity_id,
        utm_campaign,
        metadata
    ) VALUES (
        p_notification_id,
        auth.uid(),
        COALESCE(p_session_id, 'sess_' || gen_random_uuid()::text),
        p_touchpoint_type,
        p_entity_type,
        p_entity_id,
        p_utm_campaign,
        p_metadata
    ) RETURNING id INTO v_touchpoint_id;

    RETURN v_touchpoint_id;
END;
$$;


-- ----------------------------------------------------------------------------
-- 9. Automated Conversion Triggers for Core Platform Workflows
-- ----------------------------------------------------------------------------

-- 9.1 Application Submission Conversion Trigger
CREATE OR REPLACE FUNCTION public.trg_fn_attr_application_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.resolve_attributed_conversion(
            p_user_id => NEW.user_id,
            p_conversion_event => 'job_application_submitted',
            p_entity_type => 'jobs',
            p_entity_id => NEW.job_id::text,
            p_revenue_inr => 0.00,
            p_attribution_window_interval => INTERVAL '7 days',
            p_metadata => jsonb_build_object('application_id', NEW.id::text)
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attr_application_submitted ON public.job_applications;
CREATE TRIGGER trg_attr_application_submitted
    AFTER INSERT ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_attr_application_submitted();


-- 9.2 Company Follow Conversion Trigger
CREATE OR REPLACE FUNCTION public.trg_fn_attr_company_followed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.resolve_attributed_conversion(
            p_user_id => NEW.user_id,
            p_conversion_event => 'company_followed',
            p_entity_type => 'companies',
            p_entity_id => NEW.company_id::text,
            p_revenue_inr => 0.00,
            p_attribution_window_interval => INTERVAL '24 hours',
            p_metadata => jsonb_build_object('follow_id', NEW.id::text)
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_follows') THEN
        DROP TRIGGER IF EXISTS trg_attr_company_followed ON public.company_follows;
        CREATE TRIGGER trg_attr_company_followed
            AFTER INSERT ON public.company_follows
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_attr_company_followed();
    END IF;
END $$;


-- 9.3 Payment Realized Revenue Attribution Trigger
CREATE OR REPLACE FUNCTION public.trg_fn_attr_payment_realized()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only trigger on captured / paid payments (never estimate revenue!)
    IF (NEW.status = 'captured' OR NEW.status = 'paid') AND (OLD.status IS NULL OR (OLD.status <> 'captured' AND OLD.status <> 'paid')) THEN
        PERFORM public.resolve_attributed_conversion(
            p_user_id => NEW.user_id,
            p_conversion_event => 'paid_service_purchased',
            p_entity_type => 'payments',
            p_entity_id => NEW.id::text,
            p_revenue_inr => NEW.amount,
            p_attribution_window_interval => INTERVAL '30 days',
            p_payment_id => NEW.id,
            p_razorpay_payment_id => NEW.razorpay_payment_id,
            p_metadata => jsonb_build_object(
                'currency', NEW.currency,
                'payment_method', NEW.payment_method,
                'product_category', 'career_services'
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
        DROP TRIGGER IF EXISTS trg_attr_payment_realized ON public.payments;
        CREATE TRIGGER trg_attr_payment_realized
            AFTER INSERT OR UPDATE OF status ON public.payments
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_attr_payment_realized();
    END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 10. Retention Identification Procedure (Phase 5)
-- Evaluates inactive cohorts and queues preference-compliant re-engagement
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.evaluate_retention_risk_segments()
RETURNS TABLE (
    segment_type TEXT,
    identified_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_inactive_new INTEGER := 0;
    v_dormant_apps INTEGER := 0;
    v_inactive_hiring INTEGER := 0;
BEGIN
    -- 1. Newly registered but inactive users (registered 3-7 days ago, 0 applications)
    INSERT INTO public.notification_retention_segments (
        user_id, segment_type, days_inactive, journey_status, last_activity_at, scheduled_reengagement_at
    )
    SELECT 
        p.id, 
        'newly_registered_inactive', 
        EXTRACT(DAY FROM now() - p.created_at)::INTEGER,
        'identified',
        p.created_at,
        now() + INTERVAL '1 hour'
    FROM public.profiles p
    WHERE p.created_at BETWEEN now() - INTERVAL '7 days' AND now() - INTERVAL '3 days'
      AND NOT EXISTS (SELECT 1 FROM public.job_applications a WHERE a.user_id = p.id)
    ON CONFLICT (user_id, segment_type) 
    DO UPDATE SET days_inactive = EXCLUDED.days_inactive, updated_at = now();

    GET DIAGNOSTICS v_inactive_new = ROW_COUNT;

    -- 2. Candidates who stop applying (previously active, dormant > 14 days)
    INSERT INTO public.notification_retention_segments (
        user_id, segment_type, days_inactive, journey_status, last_activity_at, scheduled_reengagement_at
    )
    SELECT 
        a.user_id,
        'dormant_applicant',
        EXTRACT(DAY FROM now() - MAX(a.applied_at))::INTEGER,
        'identified',
        MAX(a.applied_at),
        now() + INTERVAL '2 hours'
    FROM public.job_applications a
    GROUP BY a.user_id
    HAVING MAX(a.applied_at) < now() - INTERVAL '14 days'
    ON CONFLICT (user_id, segment_type)
    DO UPDATE SET days_inactive = EXCLUDED.days_inactive, updated_at = now();

    GET DIAGNOSTICS v_dormant_apps = ROW_COUNT;

    -- Return identification summary
    segment_type := 'newly_registered_inactive';
    identified_count := v_inactive_new;
    RETURN NEXT;

    segment_type := 'dormant_applicant';
    identified_count := v_dormant_apps;
    RETURN NEXT;
END;
$$;


-- ----------------------------------------------------------------------------
-- 11. Conversion Funnel & Revenue Realization Views (Phase 2 & Phase 4)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_notification_conversion_funnel AS
SELECT 
    DATE(t.created_at) AS funnel_date,
    count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'generated') AS notifs_generated,
    count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'delivered') AS notifs_delivered,
    count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'opened') AS notifs_opened,
    count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'clicked') AS notifs_clicked,
    count(DISTINCT t.user_id) FILTER (WHERE t.touchpoint_type = 'job_view') AS jobs_viewed,
    count(DISTINCT t.user_id) FILTER (WHERE t.touchpoint_type = 'application_start') AS applications_started,
    count(DISTINCT t.user_id) FILTER (WHERE t.touchpoint_type = 'application_submit') AS applications_submitted,
    count(DISTINCT t.user_id) FILTER (WHERE t.touchpoint_type = 'service_purchase') AS paid_services_purchased,
    ROUND(
        (count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'clicked')::numeric / 
        NULLIF(count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'delivered'), 0) * 100), 
        2
    ) AS ctr_pct,
    ROUND(
        (count(DISTINCT t.user_id) FILTER (WHERE t.touchpoint_type = 'application_submit')::numeric / 
        NULLIF(count(DISTINCT t.notification_id) FILTER (WHERE t.touchpoint_type = 'clicked'), 0) * 100), 
        2
    ) AS click_to_application_pct
FROM public.notification_attribution_touchpoints t
GROUP BY DATE(t.created_at);

CREATE OR REPLACE VIEW public.v_notification_revenue_realization AS
SELECT 
    r.product_category,
    count(*) AS transaction_count,
    SUM(r.realized_amount_inr) AS total_realized_revenue_inr,
    SUM(r.pipeline_amount_inr) AS total_pipeline_revenue_inr,
    count(*) FILTER (WHERE r.is_verified_payment = true) AS verified_payment_count,
    ROUND(AVG(r.realized_amount_inr), 2) AS avg_order_value_inr
FROM public.notification_revenue_attributions r
GROUP BY r.product_category;

CREATE OR REPLACE VIEW public.v_notification_experiment_performance AS
SELECT 
    e.experiment_key,
    en.variant,
    count(DISTINCT en.user_id) AS enrolled_users,
    count(DISTINCT c.id) AS conversions_count,
    ROUND(
        (count(DISTINCT c.id)::numeric / NULLIF(count(DISTINCT en.user_id), 0) * 100), 
        2
    ) AS conversion_rate_pct,
    COALESCE(SUM(c.realized_revenue_inr), 0.00) AS total_realized_revenue_inr
FROM public.notification_experiments e
JOIN public.notification_experiment_enrollments en ON en.experiment_key = e.experiment_key
LEFT JOIN public.notification_attributed_conversions c ON c.user_id = en.user_id
GROUP BY e.experiment_key, en.variant;


-- ----------------------------------------------------------------------------
-- 12. Row Level Security Hardening
-- ----------------------------------------------------------------------------
ALTER TABLE public.notification_attribution_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_attributed_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_experiment_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_revenue_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_retention_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchpoints_user_policy" ON public.notification_attribution_touchpoints;
CREATE POLICY "touchpoints_user_policy" ON public.notification_attribution_touchpoints
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversions_user_policy" ON public.notification_attributed_conversions;
CREATE POLICY "conversions_user_policy" ON public.notification_attributed_conversions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "experiments_read_policy" ON public.notification_experiments;
CREATE POLICY "experiments_read_policy" ON public.notification_experiments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "enrollments_user_policy" ON public.notification_experiment_enrollments;
CREATE POLICY "enrollments_user_policy" ON public.notification_experiment_enrollments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "revenue_attr_user_policy" ON public.notification_revenue_attributions;
CREATE POLICY "revenue_attr_user_policy" ON public.notification_revenue_attributions
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin'))
    );

DROP POLICY IF EXISTS "retention_segments_admin_policy" ON public.notification_retention_segments;
CREATE POLICY "retention_segments_admin_policy" ON public.notification_retention_segments
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin'))
    );

COMMIT;
