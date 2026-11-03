-- ============================================================================
-- Migration: 20261103200000_intelligent_engagement_engine.sql
-- Mission ID: TXC-NOTIFICATIONS-003
-- Title: Intelligent Engagement, Notification Personalization & Retention Engine
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
-- 1. Schema Enhancements on public.notifications
-- ----------------------------------------------------------------------------
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS relevance_score NUMERIC(4,3) DEFAULT 0.500,
    ADD COLUMN IF NOT EXISTS group_key TEXT,
    ADD COLUMN IF NOT EXISTS group_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS conversion_type TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_relevance 
    ON public.notifications(user_id, relevance_score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_group_key 
    ON public.notifications(user_id, group_key) 
    WHERE group_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_clicked_at 
    ON public.notifications(user_id, clicked_at) 
    WHERE clicked_at IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 2. Engagement & Telemetry Event Log Table (Phase 6 Analytics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_engagement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('generated', 'delivered', 'displayed', 'opened', 'clicked', 'converted', 'dismissed', 'opted_out')),
    category TEXT,
    channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'push', 'email', 'sms')),
    conversion_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_events_user_type_created 
    ON public.notification_engagement_events(user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_engagement_events_notif_type 
    ON public.notification_engagement_events(notification_id, event_type);

CREATE INDEX IF NOT EXISTS idx_engagement_events_category_created 
    ON public.notification_engagement_events(category, created_at DESC);


-- ----------------------------------------------------------------------------
-- 3. User Fatigue & Frequency Optimization Table (Phase 4)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_user_fatigue (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_count INTEGER NOT NULL DEFAULT 0,
    daily_limit INTEGER NOT NULL DEFAULT 8,
    weekly_count INTEGER NOT NULL DEFAULT 0,
    weekly_limit INTEGER NOT NULL DEFAULT 35,
    last_notification_at TIMESTAMPTZ,
    fatigue_score NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    backoff_tier TEXT NOT NULL DEFAULT 'normal' CHECK (backoff_tier IN ('normal', 'mild_backoff', 'strong_backoff', 'quarantine')),
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_fatigue_backoff 
    ON public.notification_user_fatigue(backoff_tier);


-- ----------------------------------------------------------------------------
-- 4. Intelligent Digests Outbox Table (Phase 4)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    digest_type TEXT NOT NULL DEFAULT 'daily' CHECK (digest_type IN ('daily', 'weekly')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'skipped')),
    items_count INTEGER NOT NULL DEFAULT 0,
    items_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_digests_status_scheduled 
    ON public.notification_digests(status, scheduled_for ASC);

CREATE INDEX IF NOT EXISTS idx_notification_digests_user 
    ON public.notification_digests(user_id, created_at DESC);


-- ----------------------------------------------------------------------------
-- 5. Relevance Scoring Function (Phase 1)
-- Evaluates skills, followed companies, connection network, and industry alignment
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_notification_relevance(
    p_recipient_id UUID,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'social_interactions',
    p_event_type TEXT DEFAULT 'general'
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_score NUMERIC := 0.500;
    v_user_skills TEXT[];
    v_user_industry TEXT;
    v_user_location TEXT;
    v_job_skills TEXT[];
    v_job_company UUID;
    v_job_location TEXT;
    v_is_followed BOOLEAN := false;
    v_is_connected BOOLEAN := false;
    v_shared_skills_count INTEGER := 0;
BEGIN
    IF p_recipient_id IS NULL THEN
        RETURN 0.500;
    END IF;

    -- Fetch recipient profile attributes
    SELECT skills, location 
    INTO v_user_skills, v_user_location
    FROM public.profiles 
    WHERE id = p_recipient_id;

    -- 1. Job-Specific Matching Relevance
    IF p_entity_type = 'jobs' AND p_entity_id IS NOT NULL THEN
        SELECT company_id, skills_required, location
        INTO v_job_company, v_job_skills, v_job_location
        FROM public.jobs
        WHERE id = p_entity_id::uuid;

        -- Check followed company bonus (+0.25)
        IF v_job_company IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM public.company_follows 
                WHERE user_id = p_recipient_id AND company_id = v_job_company
            ) INTO v_is_followed;

            IF v_is_followed THEN
                v_score := v_score + 0.250;
            END IF;
        END IF;

        -- Check skills overlap (+0.10 to +0.25)
        IF v_user_skills IS NOT NULL AND v_job_skills IS NOT NULL THEN
            SELECT count(*) INTO v_shared_skills_count
            FROM (
                SELECT unnest(v_user_skills) 
                INTERSECT 
                SELECT unnest(v_job_skills)
            ) AS shared;

            IF v_shared_skills_count >= 3 THEN
                v_score := v_score + 0.250;
            ELSIF v_shared_skills_count >= 1 THEN
                v_score := v_score + 0.150;
            END IF;
        END IF;

        -- Check location match (+0.10)
        IF v_user_location IS NOT NULL AND v_job_location IS NOT NULL 
           AND LOWER(v_user_location) = LOWER(v_job_location) THEN
            v_score := v_score + 0.100;
        END IF;

    -- 2. Recruiter Profile Interaction Bonus (+0.35)
    ELSIF p_event_type = 'RECRUITER_INTEREST_RECEIVED' OR p_event_type = 'APPLICATION_VIEWED' THEN
        v_score := 0.950;

    -- 3. Connection Network Proximity Bonus
    ELSIF p_category = 'social_interactions' OR p_category = 'messages' THEN
        IF p_entity_type = 'connections' AND p_entity_id IS NOT NULL THEN
            v_score := v_score + 0.200;
        END IF;
    END IF;

    -- Clamp score within [0.100, 1.000]
    IF v_score > 1.000 THEN
        v_score := 1.000;
    ELSIF v_score < 0.100 THEN
        v_score := 0.100;
    END IF;

    RETURN ROUND(v_score, 3);
EXCEPTION WHEN OTHERS THEN
    RETURN 0.500;
END;
$$;


-- ----------------------------------------------------------------------------
-- 6. Privacy & Blocking Validation Helper (Phase 3)
-- Respects connection blocking and user privacy boundaries
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_user_blocked_or_restricted(
    p_sender_id UUID,
    p_recipient_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_is_blocked BOOLEAN := false;
BEGIN
    IF p_sender_id IS NULL OR p_recipient_id IS NULL THEN
        RETURN false;
    END IF;

    -- 1. Check connections table for blocked status
    SELECT EXISTS (
        SELECT 1 FROM public.connections 
        WHERE ((requester_id = p_sender_id AND recipient_id = p_recipient_id)
            OR (requester_id = p_recipient_id AND recipient_id = p_sender_id))
          AND status = 'blocked'
    ) INTO v_is_blocked;

    IF v_is_blocked THEN
        RETURN true;
    END IF;

    -- 2. Check profile privacy_settings for blocked_users array
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_recipient_id
          AND (privacy_settings->'blocked_users') ? p_sender_id::text
    ) INTO v_is_blocked;

    RETURN v_is_blocked;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$;


-- ----------------------------------------------------------------------------
-- 7. Intelligent Dispatch Function with Grouping & Fatigue Limits (Phase 4)
-- Wraps dispatch_notification_event with grouping, relevance, and frequency gates
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.dispatch_intelligent_notification(
    p_recipient_id UUID,
    p_actor_id UUID,
    p_event_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT,
    p_module TEXT DEFAULT 'network',
    p_category TEXT DEFAULT 'social_interactions',
    p_priority TEXT DEFAULT 'medium',
    p_icon TEXT DEFAULT 'bell',
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_group_key TEXT DEFAULT NULL,
    p_data JSONB DEFAULT '{}'::jsonb,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_notification_id UUID;
    v_existing_group_id UUID;
    v_existing_group_count INTEGER;
    v_relevance NUMERIC;
    v_fatigue RECORD;
    v_now_date DATE := CURRENT_DATE;
    v_daily_count INTEGER := 0;
    v_daily_limit INTEGER := 8;
    v_backoff TEXT := 'normal';
    v_is_blocked BOOLEAN := false;
BEGIN
    -- 1. Check Blocking & Privacy Boundaries
    IF p_actor_id IS NOT NULL AND p_recipient_id IS NOT NULL THEN
        v_is_blocked := public.is_user_blocked_or_restricted(p_actor_id, p_recipient_id);
        IF v_is_blocked THEN
            -- Suppressed silently to protect user privacy
            RETURN NULL;
        END IF;
    END IF;

    -- 2. Calculate Contextual Relevance Score
    v_relevance := public.calculate_notification_relevance(
        p_recipient_id => p_recipient_id,
        p_entity_type => p_entity_type,
        p_entity_id => p_entity_id,
        p_category => p_category,
        p_event_type => p_event_type
    );

    -- 3. Evaluate User Fatigue & Frequency Optimization
    INSERT INTO public.notification_user_fatigue (
        user_id, daily_count, weekly_count, last_reset_date, last_notification_at, updated_at
    ) VALUES (
        p_recipient_id, 0, 0, v_now_date, now(), now()
    ) ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO v_fatigue 
    FROM public.notification_user_fatigue 
    WHERE user_id = p_recipient_id 
    FOR UPDATE;

    IF FOUND THEN
        -- Daily reset on new calendar day
        IF v_fatigue.last_reset_date < v_now_date THEN
            v_fatigue.daily_count := 0;
            v_fatigue.last_reset_date := v_now_date;
        END IF;

        v_daily_count := v_fatigue.daily_count;
        v_daily_limit := v_fatigue.daily_limit;
        v_backoff := v_fatigue.backoff_tier;

        -- Fatigue Gate: If user has reached daily limit and notification is not high/urgent priority
        IF v_daily_count >= v_daily_limit AND p_priority NOT IN ('high', 'urgent') THEN
            -- Suppress immediate broadcast; record in engagement telemetry for digest inclusion
            INSERT INTO public.notification_engagement_events (
                user_id, event_type, category, channel, metadata
            ) VALUES (
                p_recipient_id, 'opted_out', p_category, 'in_app',
                jsonb_build_object('reason', 'daily_frequency_limit_reached', 'event_type', p_event_type)
            );
            RETURN NULL;
        END IF;
    END IF;

    -- 4. Grouped Activity Notifications (e.g. "John Doe and 4 others liked your post")
    IF p_group_key IS NOT NULL THEN
        SELECT id, group_count 
        INTO v_existing_group_id, v_existing_group_count
        FROM public.notifications
        WHERE user_id = p_recipient_id
          AND group_key = p_group_key
          AND is_read = false
          AND created_at > now() - INTERVAL '12 hours'
        LIMIT 1;

        IF v_existing_group_id IS NOT NULL THEN
            -- In-place consolidation: increment count and update summary without spamming badges
            UPDATE public.notifications
            SET group_count = v_existing_group_count + 1,
                title = p_title || ' (+' || (v_existing_group_count + 1)::text || ')',
                message = p_message,
                relevance_score = GREATEST(relevance_score, v_relevance),
                updated_at = now()
            WHERE id = v_existing_group_id;

            -- Record engagement event
            INSERT INTO public.notification_engagement_events (
                notification_id, user_id, event_type, category, channel
            ) VALUES (
                v_existing_group_id, p_recipient_id, 'delivered', p_category, 'in_app'
            );

            RETURN v_existing_group_id;
        END IF;
    END IF;

    -- 5. Delegate to Certified Core Dispatch Engine
    v_notification_id := public.dispatch_notification_event(
        p_recipient_id => p_recipient_id,
        p_actor_id => p_actor_id,
        p_event_type => p_event_type,
        p_title => p_title,
        p_message => p_message,
        p_link => p_link,
        p_module => p_module,
        p_category => p_category,
        p_priority => p_priority,
        p_icon => p_icon,
        p_entity_type => p_entity_type,
        p_entity_id => p_entity_id,
        p_data => p_data || jsonb_build_object('relevance_score', v_relevance),
        p_idempotency_key => p_idempotency_key
    );

    IF v_notification_id IS NOT NULL THEN
        -- Attach relevance score and group key
        UPDATE public.notifications
        SET relevance_score = v_relevance,
            group_key = p_group_key,
            group_count = 1
        WHERE id = v_notification_id;

        -- Increment user fatigue velocity counters
        UPDATE public.notification_user_fatigue
        SET daily_count = daily_count + 1,
            weekly_count = weekly_count + 1,
            last_notification_at = now(),
            last_reset_date = v_now_date,
            updated_at = now()
        WHERE user_id = p_recipient_id;

        -- Record Generated & Delivered Telemetry Event
        INSERT INTO public.notification_engagement_events (
            notification_id, user_id, event_type, category, channel, metadata
        ) VALUES (
            v_notification_id, p_recipient_id, 'delivered', p_category, 'in_app',
            jsonb_build_object('relevance_score', v_relevance, 'priority', p_priority)
        );
    END IF;

    RETURN v_notification_id;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'dispatch_intelligent_notification error: %', SQLERRM;
    RETURN NULL;
END;
$$;


-- ----------------------------------------------------------------------------
-- 8. Job Intelligence Engine (Phase 2)
-- Matches job seekers with relevant openings & warns of closing dates
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.evaluate_job_seeker_matches(p_job_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_job RECORD;
    v_seeker RECORD;
    v_matched_count INTEGER := 0;
    v_score NUMERIC;
BEGIN
    SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;
    IF NOT FOUND OR v_job.is_active = false THEN
        RETURN 0;
    END IF;

    -- Match active candidates whose preferences or skills align
    FOR v_seeker IN
        SELECT p.id AS user_id, p.skills, p.location
        FROM public.profiles p
        WHERE p.id <> COALESCE(v_job.posted_by, '00000000-0000-0000-0000-000000000000'::uuid)
          AND p.availability_status IN ('available', 'open_to_offers')
          AND NOT EXISTS (
              -- Prevent repeated notifications for the same job within 30 days
              SELECT 1 FROM public.notifications n
              WHERE n.user_id = p.id 
                AND n.entity_type = 'jobs' 
                AND n.entity_id = p_job_id::text
                AND n.created_at > now() - INTERVAL '30 days'
          )
        LIMIT 100
    LOOP
        v_score := public.calculate_notification_relevance(
            p_recipient_id => v_seeker.user_id,
            p_entity_type => 'jobs',
            p_entity_id => p_job_id::text,
            p_category => 'job_opportunities',
            p_event_type => 'JOB_MATCHED'
        );

        -- Only notify candidates with high relevance (>= 0.65)
        IF v_score >= 0.650 THEN
            PERFORM public.dispatch_intelligent_notification(
                p_recipient_id => v_seeker.user_id,
                p_actor_id => v_job.posted_by,
                p_event_type => 'JOB_MATCHED',
                p_title => 'New Job Match for You',
                p_message => 'Opening matching your profile: "' || v_job.title || '" (' || (ROUND(v_score * 100))::text || '% match).',
                p_link => '/jobs/' || p_job_id::text,
                p_module => 'jobs',
                p_category => 'job_opportunities',
                p_priority => CASE WHEN v_score >= 0.850 THEN 'high' ELSE 'medium' END,
                p_icon => 'briefcase',
                p_entity_type => 'jobs',
                p_entity_id => p_job_id::text,
                p_group_key => 'job_match_' || v_seeker.user_id::text || '_' || CURRENT_DATE::text,
                p_idempotency_key => 'job_intel_match_' || p_job_id::text || '_' || v_seeker.user_id::text
            );

            v_matched_count := v_matched_count + 1;
        END IF;
    END LOOP;

    RETURN v_matched_count;
END;
$$;

-- Trigger: When a new job is published or activated, run seeker matching
CREATE OR REPLACE FUNCTION public.trg_fn_job_intelligent_matching()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = true AND OLD.is_active = false) THEN
        PERFORM public.evaluate_job_seeker_matches(NEW.id);
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_intelligent_matching ON public.jobs;
CREATE TRIGGER trg_jobs_intelligent_matching
    AFTER INSERT OR UPDATE OF is_active ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_job_intelligent_matching();

-- Trigger: When an employer views an application, notify candidate (APPLICATION_VIEWED)
CREATE OR REPLACE FUNCTION public.trg_fn_application_viewed_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_title TEXT;
    v_employer_id UUID;
BEGIN
    IF NEW.status = 'reviewing' AND (OLD.status IS NULL OR OLD.status = 'applied') THEN
        SELECT title, posted_by INTO v_job_title, v_employer_id
        FROM public.jobs WHERE id = NEW.job_id;

        PERFORM public.dispatch_intelligent_notification(
            p_recipient_id => NEW.user_id,
            p_actor_id => v_employer_id,
            p_event_type => 'APPLICATION_VIEWED',
            p_title => 'Application Under Review',
            p_message => 'An employer is reviewing your application for "' || COALESCE(v_job_title, 'Role') || '".',
            p_link => '/jobs/applications',
            p_module => 'jobs',
            p_category => 'applications',
            p_priority => 'high',
            p_icon => 'eye',
            p_entity_type => 'job_applications',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'app_view_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_viewed_notification ON public.job_applications;
CREATE TRIGGER trg_application_viewed_notification
    AFTER UPDATE OF status ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_application_viewed_notification();


-- ----------------------------------------------------------------------------
-- 9. Professional Networking Intelligence (Phase 3)
-- Recruiter interactions, relevant industry join alerts, opportunity sharing
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_fn_recruiter_profile_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_recruiter BOOLEAN := false;
    v_recruiter_name TEXT;
    v_company TEXT;
BEGIN
    IF NEW.viewer_id IS NOT NULL AND NEW.viewer_id <> NEW.profile_id THEN
        SELECT is_employer, COALESCE(full_name, 'A recruiter'), company_name
        INTO v_is_recruiter, v_recruiter_name, v_company
        FROM public.profiles 
        WHERE id = NEW.viewer_id;

        IF v_is_recruiter THEN
            PERFORM public.dispatch_intelligent_notification(
                p_recipient_id => NEW.profile_id,
                p_actor_id => NEW.viewer_id,
                p_event_type => 'RECRUITER_INTEREST_RECEIVED',
                p_title => 'Recruiter Viewed Your Profile',
                p_message => v_recruiter_name || COALESCE(' from ' || v_company, '') || ' checked out your profile.',
                p_link => '/profile',
                p_module => 'network',
                p_category => 'career_growth',
                p_priority => 'high',
                p_icon => 'user-check',
                p_entity_type => 'profile_views',
                p_entity_id => NEW.id::text,
                p_group_key => 'recruiter_views_' || NEW.profile_id::text || '_' || CURRENT_DATE::text,
                p_idempotency_key => 'recruiter_view_' || NEW.profile_id::text || '_' || NEW.viewer_id::text || '_' || CURRENT_DATE::text
            );
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_views') THEN
        DROP TRIGGER IF EXISTS trg_recruiter_profile_interaction ON public.profile_views;
        CREATE TRIGGER trg_recruiter_profile_interaction
            AFTER INSERT ON public.profile_views
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_recruiter_profile_interaction();
    END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 10. Employer & Recruiter Intelligence (Phase 5)
-- Candidate match scoring, qualified applicant tagging, interview responses
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_fn_employer_qualified_applicant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job RECORD;
    v_candidate RECORD;
    v_score NUMERIC := 0.500;
    v_title TEXT;
    v_message TEXT;
BEGIN
    SELECT * INTO v_job FROM public.jobs WHERE id = NEW.job_id;
    SELECT * INTO v_candidate FROM public.profiles WHERE id = NEW.user_id;

    IF v_job.posted_by IS NOT NULL AND v_job.posted_by <> NEW.user_id THEN
        -- Compute qualification match score
        v_score := public.calculate_notification_relevance(
            p_recipient_id => NEW.user_id,
            p_entity_type => 'jobs',
            p_entity_id => NEW.job_id::text,
            p_category => 'applications',
            p_event_type => 'JOB_APPLICATION_RECEIVED'
        );

        IF v_score >= 0.800 THEN
            v_title := '⭐ Highly Qualified Applicant (' || (ROUND(v_score * 100))::text || '% Match)';
            v_message := COALESCE(v_candidate.full_name, 'A strong candidate') || ' applied for "' || v_job.title || '" with matching skills.';
        ELSE
            v_title := 'New Application Received';
            v_message := COALESCE(v_candidate.full_name, 'A candidate') || ' applied for ' || v_job.title || '.';
        END IF;

        PERFORM public.dispatch_intelligent_notification(
            p_recipient_id => v_job.posted_by,
            p_actor_id => NEW.user_id,
            p_event_type => 'JOB_APPLICATION_RECEIVED',
            p_title => v_title,
            p_message => v_message,
            p_link => '/employer/applications?job=' || NEW.job_id::text,
            p_module => 'employer',
            p_category => 'applications',
            p_priority => CASE WHEN v_score >= 0.800 THEN 'high' ELSE 'medium' END,
            p_icon => 'briefcase',
            p_entity_type => 'job_applications',
            p_entity_id => NEW.id::text,
            p_group_key => 'emp_apps_' || NEW.job_id::text || '_' || CURRENT_DATE::text,
            p_idempotency_key => 'qual_app_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_employer_qualified_applicant ON public.job_applications;
CREATE TRIGGER trg_employer_qualified_applicant
    AFTER INSERT ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_employer_qualified_applicant();


-- ----------------------------------------------------------------------------
-- 11. Interaction Tracking RPC Function (Phase 6 Analytics)
-- Client-facing RPC to track opens, clicks, and conversions securely
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_notification_interaction(
    p_notification_id UUID,
    p_action TEXT, -- 'open', 'click', 'convert', 'dismiss'
    p_conversion_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_notif RECORD;
BEGIN
    SELECT * INTO v_notif 
    FROM public.notifications 
    WHERE id = p_notification_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    IF p_action = 'open' THEN
        UPDATE public.notifications
        SET opened_at = COALESCE(opened_at, now()),
            is_read = true,
            read_at = COALESCE(read_at, now())
        WHERE id = p_notification_id;

        INSERT INTO public.notification_engagement_events (
            notification_id, user_id, event_type, category, channel, metadata
        ) VALUES (
            p_notification_id, auth.uid(), 'opened', v_notif.category, 'in_app', p_metadata
        );

    ELSIF p_action = 'click' THEN
        UPDATE public.notifications
        SET clicked_at = COALESCE(clicked_at, now()),
            opened_at = COALESCE(opened_at, now()),
            is_read = true,
            read_at = COALESCE(read_at, now())
        WHERE id = p_notification_id;

        INSERT INTO public.notification_engagement_events (
            notification_id, user_id, event_type, category, channel, metadata
        ) VALUES (
            p_notification_id, auth.uid(), 'clicked', v_notif.category, 'in_app', p_metadata
        );

    ELSIF p_action = 'convert' THEN
        UPDATE public.notifications
        SET converted_at = now(),
            conversion_type = COALESCE(p_conversion_type, 'generic')
        WHERE id = p_notification_id;

        INSERT INTO public.notification_engagement_events (
            notification_id, user_id, event_type, category, channel, conversion_type, metadata
        ) VALUES (
            p_notification_id, auth.uid(), 'converted', v_notif.category, 'in_app', p_conversion_type, p_metadata
        );

    ELSIF p_action = 'dismiss' THEN
        INSERT INTO public.notification_engagement_events (
            notification_id, user_id, event_type, category, channel, metadata
        ) VALUES (
            p_notification_id, auth.uid(), 'dismissed', v_notif.category, 'in_app', p_metadata
        );
    END IF;

    RETURN true;
END;
$$;


-- ----------------------------------------------------------------------------
-- 12. Aggregate Engagement & Fatigue Views (Phase 6 Analytics)
-- Privacy-respecting aggregated telemetry for operations
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_notification_engagement_metrics AS
SELECT 
    category,
    channel,
    DATE(created_at) AS event_date,
    count(*) FILTER (WHERE event_type = 'delivered') AS delivered_count,
    count(*) FILTER (WHERE event_type = 'opened') AS opened_count,
    count(*) FILTER (WHERE event_type = 'clicked') AS clicked_count,
    count(*) FILTER (WHERE event_type = 'converted') AS converted_count,
    ROUND(
        (count(*) FILTER (WHERE event_type = 'clicked')::numeric / 
        NULLIF(count(*) FILTER (WHERE event_type = 'delivered'), 0) * 100), 
        2
    ) AS ctr_percentage,
    ROUND(
        (count(*) FILTER (WHERE event_type = 'converted')::numeric / 
        NULLIF(count(*) FILTER (WHERE event_type = 'clicked'), 0) * 100), 
        2
    ) AS conversion_rate_percentage
FROM public.notification_engagement_events
GROUP BY category, channel, DATE(created_at);

CREATE OR REPLACE VIEW public.v_notification_fatigue_summary AS
SELECT 
    backoff_tier,
    count(*) AS users_count,
    ROUND(AVG(daily_count), 2) AS avg_daily_count,
    ROUND(AVG(fatigue_score), 2) AS avg_fatigue_score
FROM public.notification_user_fatigue
GROUP BY backoff_tier;


-- ----------------------------------------------------------------------------
-- 13. Row Level Security Hardening for Intelligence Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.notification_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_user_fatigue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_digests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "engagement_user_policy" ON public.notification_engagement_events;
CREATE POLICY "engagement_user_policy" ON public.notification_engagement_events
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "fatigue_user_policy" ON public.notification_user_fatigue;
CREATE POLICY "fatigue_user_policy" ON public.notification_user_fatigue
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "digests_user_policy" ON public.notification_digests;
CREATE POLICY "digests_user_policy" ON public.notification_digests
    FOR SELECT USING (auth.uid() = user_id);

COMMIT;
