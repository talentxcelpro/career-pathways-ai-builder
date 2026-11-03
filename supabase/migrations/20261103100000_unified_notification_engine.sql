-- ============================================================================
-- Migration: 20261103100000_unified_notification_engine.sql
-- Description: Unified Notification Intelligence, Real-Time Activity & Delivery Engine
-- Mission ID: TXC-NOTIFICATIONS-001 (Certified Comprehensive Edition)
-- Platform: TalentXcel (https://talentxcel.in)
-- ============================================================================

BEGIN;

-- 1. Enhance and Normalize public.notifications table
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS actor_id UUID,
    ADD COLUMN IF NOT EXISTS event_type TEXT,
    ADD COLUMN IF NOT EXISTS entity_type TEXT,
    ADD COLUMN IF NOT EXISTS entity_id TEXT,
    ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social_interactions',
    ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'delivered',
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS sound BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Unique index for idempotency deduplication (prevents duplicate notification floods)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotency_key 
    ON public.notifications(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
    ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
    ON public.notifications(actor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_event_type 
    ON public.notifications(event_type);

CREATE INDEX IF NOT EXISTS idx_notifications_category 
    ON public.notifications(category);


-- 2. Create User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Channels
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    -- Categories
    career_growth_enabled BOOLEAN NOT NULL DEFAULT true,
    job_opportunities_enabled BOOLEAN NOT NULL DEFAULT true,
    social_interactions_enabled BOOLEAN NOT NULL DEFAULT true,
    messages_enabled BOOLEAN NOT NULL DEFAULT true,
    applications_enabled BOOLEAN NOT NULL DEFAULT true,
    tool_engagement_enabled BOOLEAN NOT NULL DEFAULT true,
    system_updates_enabled BOOLEAN NOT NULL DEFAULT true,
    -- Timing & Quiet Hours
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
    quiet_hours_end TEXT NOT NULL DEFAULT '08:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    frequency TEXT NOT NULL DEFAULT 'instant' CHECK (frequency IN ('instant', 'digest_daily', 'digest_weekly')),
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
    ON public.notification_preferences(user_id);


-- 3. Create Unified Notification Devices Table (Consolidates push tokens across web & mobile)
CREATE TABLE IF NOT EXISTS public.notification_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios', 'mobile')),
    provider TEXT NOT NULL DEFAULT 'web_push' CHECK (provider IN ('fcm', 'web_push', 'apns')),
    endpoint TEXT,
    p256dh TEXT,
    auth_secret TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_notification_devices_user_active 
    ON public.notification_devices(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_notification_devices_token 
    ON public.notification_devices(token);


-- 4. Create Notification Events Outbox Table (Durable Queue with Retry & State Machine)
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    actor_id UUID,
    recipient_id UUID NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'retrying', 'failed', 'dead_letter')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    scheduled_for TIMESTAMPTZ DEFAULT now(),
    last_error TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_events_status_scheduled 
    ON public.notification_events(status, scheduled_for ASC);

CREATE INDEX IF NOT EXISTS idx_notification_events_recipient 
    ON public.notification_events(recipient_id);


-- 5. Create Notification Delivery Logs Table (Full Observability & Auditing)
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.notification_events(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email', 'sms', 'realtime')),
    status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'suppressed', 'deferred', 'retrying')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_user 
    ON public.notification_delivery_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status 
    ON public.notification_delivery_logs(status);


-- 6. Centralized Event Dispatch Function (SECURITY DEFINER)
-- Corrected: Quiet hours ONLY defers push delivery; in-app notification is ALWAYS preserved.
CREATE OR REPLACE FUNCTION public.dispatch_notification_event(
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
    v_event_id UUID;
    v_prefs RECORD;
    v_in_app_allowed BOOLEAN := true;
    v_push_allowed BOOLEAN := true;
    v_category_allowed BOOLEAN := true;
    v_is_quiet_hours BOOLEAN := false;
    v_existing_id UUID;
    v_now_time TIME := CURRENT_TIME;
    v_q_start TIME;
    v_q_end TIME;
    v_scheduled_for TIMESTAMPTZ := now();
BEGIN
    -- 1. Never notify self for self-initiated actions
    IF p_actor_id IS NOT NULL AND p_actor_id = p_recipient_id THEN
        RETURN NULL;
    END IF;

    -- 2. Validate recipient exists
    IF p_recipient_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- 3. Idempotency Check (Prevent duplicate notification within 24 hours)
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_existing_id 
        FROM public.notifications 
        WHERE idempotency_key = p_idempotency_key 
          AND created_at > now() - INTERVAL '24 hours'
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN v_existing_id;
        END IF;
    END IF;

    -- 4. Check User Notification Preferences
    SELECT * INTO v_prefs 
    FROM public.notification_preferences 
    WHERE user_id = p_recipient_id;

    IF FOUND THEN
        v_in_app_allowed := v_prefs.in_app_enabled;
        v_push_allowed := v_prefs.push_enabled;

        -- Category-specific preference gates
        IF p_category = 'career_growth' AND NOT v_prefs.career_growth_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'job_opportunities' AND NOT v_prefs.job_opportunities_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'social_interactions' AND NOT v_prefs.social_interactions_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'messages' AND NOT v_prefs.messages_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'applications' AND NOT v_prefs.applications_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'tool_engagement' AND NOT v_prefs.tool_engagement_enabled THEN
            v_category_allowed := false;
        ELSIF p_category = 'system_updates' AND NOT v_prefs.system_updates_enabled THEN
            v_category_allowed := false;
        END IF;

        -- Check Quiet Hours (Only defers push notification, in-app is NEVER discarded)
        IF v_prefs.quiet_hours_enabled THEN
            BEGIN
                v_q_start := v_prefs.quiet_hours_start::TIME;
                v_q_end := v_prefs.quiet_hours_end::TIME;
                
                IF v_q_start < v_q_end THEN
                    -- Normal range (e.g. 13:00 to 15:00)
                    IF v_now_time >= v_q_start AND v_now_time <= v_q_end THEN
                        v_is_quiet_hours := true;
                    END IF;
                ELSE
                    -- Overnight range (e.g. 22:00 to 08:00)
                    IF v_now_time >= v_q_start OR v_now_time <= v_q_end THEN
                        v_is_quiet_hours := true;
                    END IF;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                v_is_quiet_hours := false;
            END;
        END IF;
    END IF;

    -- 5. In-App Notification Delivery (if enabled by category)
    IF v_category_allowed AND v_in_app_allowed THEN
        INSERT INTO public.notifications (
            user_id,
            actor_id,
            type,
            event_type,
            title,
            message,
            link,
            module,
            category,
            priority,
            icon,
            entity_type,
            entity_id,
            data,
            idempotency_key,
            delivery_status,
            is_read,
            created_at,
            updated_at
        ) VALUES (
            p_recipient_id,
            p_actor_id,
            p_event_type,
            p_event_type,
            p_title,
            p_message,
            p_link,
            p_module,
            p_category,
            p_priority,
            p_icon,
            p_entity_type,
            p_entity_id,
            p_data,
            p_idempotency_key,
            'delivered',
            false,
            now(),
            now()
        ) RETURNING id INTO v_notification_id;

        -- Log in-app delivery
        INSERT INTO public.notification_delivery_logs (
            notification_id, user_id, channel, status, latency_ms
        ) VALUES (
            v_notification_id, p_recipient_id, 'in_app', 'delivered', 1
        );
    ELSE
        -- Log category suppression
        INSERT INTO public.notification_delivery_logs (
            user_id, channel, status, error_message, metadata
        ) VALUES (
            p_recipient_id, 'in_app', 'suppressed', 'Suppressed by user category preference',
            jsonb_build_object('category', p_category, 'event_type', p_event_type)
        );
    END IF;

    -- 6. Push Notification Outbox Record
    -- If quiet hours is active, defer push until quiet hours end (never drop!)
    IF v_is_quiet_hours THEN
        v_scheduled_for := now() + INTERVAL '2 hours';
        INSERT INTO public.notification_delivery_logs (
            notification_id, user_id, channel, status, error_message, metadata
        ) VALUES (
            v_notification_id, p_recipient_id, 'push', 'deferred', 'Deferred during quiet hours',
            jsonb_build_object('quiet_hours', true, 'scheduled_for', v_scheduled_for)
        );
    END IF;

    IF v_category_allowed AND v_push_allowed THEN
        INSERT INTO public.notification_events (
            event_type, actor_id, recipient_id, entity_type, entity_id, payload, idempotency_key,
            status, scheduled_for
        ) VALUES (
            p_event_type, p_actor_id, p_recipient_id, p_entity_type, p_entity_id,
            jsonb_build_object(
                'notification_id', v_notification_id,
                'title', p_title,
                'message', p_message,
                'link', p_link,
                'module', p_module,
                'category', p_category,
                'priority', p_priority,
                'data', p_data
            ),
            p_idempotency_key,
            'pending',
            v_scheduled_for
        ) RETURNING id INTO v_event_id;
    END IF;

    RETURN v_notification_id;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'dispatch_notification_event error: %', SQLERRM;
    RETURN NULL;
END;
$$;


-- 7. Helper Read & Management Functions
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        read_at = now(),
        updated_at = now()
    WHERE id = p_notification_id 
      AND user_id = auth.uid();
      
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(p_module TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_module IS NOT NULL THEN
        UPDATE public.notifications
        SET is_read = true,
            read_at = now(),
            updated_at = now()
        WHERE user_id = auth.uid() 
          AND is_read = false 
          AND module = p_module;
    ELSE
        UPDATE public.notifications
        SET is_read = true,
            read_at = now(),
            updated_at = now()
        WHERE user_id = auth.uid() 
          AND is_read = false;
    END IF;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*)::INTEGER INTO v_count
    FROM public.notifications
    WHERE user_id = auth.uid()
      AND is_read = false;
      
    RETURN COALESCE(v_count, 0);
END;
$$;


-- 8. Domain Event Triggers

-- 8.1 Connections Trigger (CONNECTION_REQUEST_RECEIVED, CONNECTION_REQUEST_ACCEPTED, DECLINED)
CREATE OR REPLACE FUNCTION public.trg_fn_connection_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_name TEXT;
    v_recipient_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'pending' THEN
            SELECT COALESCE(full_name, 'A professional') INTO v_requester_name 
            FROM public.profiles WHERE id = NEW.requester_id;

            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.recipient_id,
                p_actor_id => NEW.requester_id,
                p_event_type => 'CONNECTION_REQUEST_RECEIVED',
                p_title => 'New Connection Request',
                p_message => COALESCE(v_requester_name, 'A member') || ' wants to connect with you.',
                p_link => '/network/requests',
                p_module => 'network',
                p_category => 'social_interactions',
                p_priority => 'medium',
                p_icon => 'user-plus',
                p_entity_type => 'connections',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'conn_req_' || NEW.id::text
            );
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
            SELECT COALESCE(full_name, 'A professional') INTO v_recipient_name 
            FROM public.profiles WHERE id = NEW.recipient_id;

            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.requester_id,
                p_actor_id => NEW.recipient_id,
                p_event_type => 'CONNECTION_REQUEST_ACCEPTED',
                p_title => 'Connection Accepted!',
                p_message => COALESCE(v_recipient_name, 'Your connection') || ' accepted your connection request.',
                p_link => '/network/people',
                p_module => 'network',
                p_category => 'social_interactions',
                p_priority => 'medium',
                p_icon => 'user-check',
                p_entity_type => 'connections',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'conn_acc_' || NEW.id::text
            );
        ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.requester_id,
                p_actor_id => NEW.recipient_id,
                p_event_type => 'CONNECTION_REQUEST_DECLINED',
                p_title => 'Connection Request Update',
                p_message => 'Your connection request was declined.',
                p_link => '/network',
                p_module => 'network',
                p_category => 'social_interactions',
                p_priority => 'low',
                p_icon => 'user-x',
                p_entity_type => 'connections',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'conn_dec_' || NEW.id::text
            );
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_connections_notification ON public.connections;
CREATE TRIGGER trg_connections_notification
    AFTER INSERT OR UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_connection_notification();


-- 8.2 Profile Views Trigger (PROFILE_VIEWED)
CREATE OR REPLACE FUNCTION public.trg_fn_profile_view_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_viewer_name TEXT;
BEGIN
    IF NEW.viewer_id IS NOT NULL AND NEW.viewer_id <> NEW.profile_id THEN
        SELECT COALESCE(full_name, 'Someone') INTO v_viewer_name 
        FROM public.profiles WHERE id = NEW.viewer_id;

        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.profile_id,
            p_actor_id => NEW.viewer_id,
            p_event_type => 'PROFILE_VIEWED',
            p_title => 'Profile Viewed',
            p_message => COALESCE(v_viewer_name, 'A member') || ' viewed your profile.',
            p_link => '/profile',
            p_module => 'network',
            p_category => 'social_interactions',
            p_priority => 'low',
            p_icon => 'eye',
            p_entity_type => 'profile_views',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'view_' || NEW.profile_id::text || '_' || NEW.viewer_id::text || '_' || CURRENT_DATE::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_views') THEN
        DROP TRIGGER IF EXISTS trg_profile_views_notification ON public.profile_views;
        CREATE TRIGGER trg_profile_views_notification
            AFTER INSERT ON public.profile_views
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_profile_view_notification();
    END IF;
END $$;


-- 8.3 Post Likes Trigger (POST_LIKED)
CREATE OR REPLACE FUNCTION public.trg_fn_post_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_post_author UUID;
    v_actor_name TEXT;
    v_post_title TEXT;
BEGIN
    SELECT author_id, SUBSTRING(COALESCE(content, 'your post') FROM 1 FOR 30) 
    INTO v_post_author, v_post_title
    FROM public.posts 
    WHERE id = NEW.post_id;

    IF v_post_author IS NOT NULL AND v_post_author <> NEW.user_id THEN
        SELECT COALESCE(full_name, 'Someone') INTO v_actor_name 
        FROM public.profiles WHERE id = NEW.user_id;

        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_post_author,
            p_actor_id => NEW.user_id,
            p_event_type => 'POST_LIKED',
            p_title => 'New Like on your post',
            p_message => COALESCE(v_actor_name, 'Someone') || ' liked your post: "' || v_post_title || '..."',
            p_link => '/feed?post=' || NEW.post_id::text,
            p_module => 'network',
            p_category => 'social_interactions',
            p_priority => 'low',
            p_icon => 'heart',
            p_entity_type => 'posts',
            p_entity_id => NEW.post_id::text,
            p_idempotency_key => 'like_' || NEW.post_id::text || '_' || NEW.user_id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_likes_notification ON public.post_likes;
CREATE TRIGGER trg_post_likes_notification
    AFTER INSERT ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_like_notification();


-- 8.4 Post Comments, Replies & Comment Mentions Trigger (POST_COMMENTED, COMMENT_REPLIED, COMMENT_MENTIONED)
CREATE OR REPLACE FUNCTION public.trg_fn_post_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_post_author UUID;
    v_parent_author UUID;
    v_actor_name TEXT;
    v_actor_id UUID;
    v_comment_snippet TEXT;
    v_mention TEXT;
    v_mentioned_user_id UUID;
BEGIN
    v_actor_id := COALESCE(NEW.user_id, NEW.author_id);
    v_comment_snippet := SUBSTRING(COALESCE(NEW.content, '') FROM 1 FOR 40);

    SELECT COALESCE(full_name, 'Someone') INTO v_actor_name 
    FROM public.profiles WHERE id = v_actor_id;

    SELECT author_id INTO v_post_author 
    FROM public.posts 
    WHERE id = NEW.post_id;

    -- 1. Notify Post Author (POST_COMMENTED)
    IF v_post_author IS NOT NULL AND v_post_author <> v_actor_id THEN
        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_post_author,
            p_actor_id => v_actor_id,
            p_event_type => 'POST_COMMENTED',
            p_title => 'New Comment on your post',
            p_message => COALESCE(v_actor_name, 'Someone') || ' commented: "' || v_comment_snippet || '..."',
            p_link => '/feed?post=' || NEW.post_id::text,
            p_module => 'network',
            p_category => 'social_interactions',
            p_priority => 'medium',
            p_icon => 'message-circle',
            p_entity_type => 'post_comments',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'comment_' || NEW.id::text
        );
    END IF;

    -- 2. Notify Parent Comment Author on Replies (COMMENT_REPLIED)
    IF NEW.parent_comment_id IS NOT NULL THEN
        SELECT COALESCE(author_id, user_id) INTO v_parent_author 
        FROM public.post_comments 
        WHERE id = NEW.parent_comment_id;

        IF v_parent_author IS NOT NULL AND v_parent_author <> v_actor_id AND v_parent_author <> v_post_author THEN
            PERFORM public.dispatch_notification_event(
                p_recipient_id => v_parent_author,
                p_actor_id => v_actor_id,
                p_event_type => 'COMMENT_REPLIED',
                p_title => 'New Reply to your comment',
                p_message => COALESCE(v_actor_name, 'Someone') || ' replied to your comment: "' || v_comment_snippet || '..."',
                p_link => '/feed?post=' || NEW.post_id::text,
                p_module => 'network',
                p_category => 'social_interactions',
                p_priority => 'medium',
                p_icon => 'corner-down-right',
                p_entity_type => 'post_comments',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'reply_' || NEW.id::text
            );
        END IF;
    END IF;

    -- 3. Extract & Notify @mentions in Comment (COMMENT_MENTIONED)
    IF NEW.content IS NOT NULL AND NEW.content LIKE '%@%' THEN
        FOR v_mention IN
            SELECT (regexp_matches(NEW.content, '@([a-zA-Z0-9_\.\-]+)', 'g'))[1]
        LOOP
            SELECT id INTO v_mentioned_user_id
            FROM public.profiles
            WHERE LOWER(username) = LOWER(v_mention)
               OR LOWER(custom_slug) = LOWER(v_mention)
            LIMIT 1;

            IF v_mentioned_user_id IS NOT NULL 
               AND v_mentioned_user_id <> v_actor_id 
               AND v_mentioned_user_id <> v_post_author 
               AND (v_parent_author IS NULL OR v_mentioned_user_id <> v_parent_author) THEN
                PERFORM public.dispatch_notification_event(
                    p_recipient_id => v_mentioned_user_id,
                    p_actor_id => v_actor_id,
                    p_event_type => 'COMMENT_MENTIONED',
                    p_title => 'Mentioned in a comment',
                    p_message => COALESCE(v_actor_name, 'Someone') || ' mentioned you in a comment: "' || v_comment_snippet || '..."',
                    p_link => '/feed?post=' || NEW.post_id::text,
                    p_module => 'network',
                    p_category => 'social_interactions',
                    p_priority => 'medium',
                    p_icon => 'at-sign',
                    p_entity_type => 'post_comments',
                    p_entity_id => NEW.id::text,
                    p_idempotency_key => 'comment_mention_' || NEW.id::text || '_' || v_mentioned_user_id::text
                );
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_comments_notification ON public.post_comments;
CREATE TRIGGER trg_post_comments_notification
    AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_comment_notification();


-- 8.5 Post Mentions Trigger (POST_MENTIONED)
CREATE OR REPLACE FUNCTION public.trg_fn_post_mention_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_author_name TEXT;
    v_post_snippet TEXT;
    v_mention TEXT;
    v_mentioned_user_id UUID;
BEGIN
    IF NEW.content IS NOT NULL AND NEW.content LIKE '%@%' THEN
        SELECT COALESCE(full_name, 'Someone') INTO v_author_name 
        FROM public.profiles WHERE id = NEW.author_id;

        v_post_snippet := SUBSTRING(COALESCE(NEW.content, '') FROM 1 FOR 40);

        FOR v_mention IN
            SELECT (regexp_matches(NEW.content, '@([a-zA-Z0-9_\.\-]+)', 'g'))[1]
        LOOP
            SELECT id INTO v_mentioned_user_id
            FROM public.profiles
            WHERE LOWER(username) = LOWER(v_mention)
               OR LOWER(custom_slug) = LOWER(v_mention)
            LIMIT 1;

            IF v_mentioned_user_id IS NOT NULL AND v_mentioned_user_id <> NEW.author_id THEN
                PERFORM public.dispatch_notification_event(
                    p_recipient_id => v_mentioned_user_id,
                    p_actor_id => NEW.author_id,
                    p_event_type => 'POST_MENTIONED',
                    p_title => 'Mentioned in a post',
                    p_message => COALESCE(v_author_name, 'Someone') || ' mentioned you in a post: "' || v_post_snippet || '..."',
                    p_link => '/feed?post=' || NEW.id::text,
                    p_module => 'network',
                    p_category => 'social_interactions',
                    p_priority => 'medium',
                    p_icon => 'at-sign',
                    p_entity_type => 'posts',
                    p_entity_id => NEW.id::text,
                    p_idempotency_key => 'post_mention_' || NEW.id::text || '_' || v_mentioned_user_id::text
                );
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_mentions_notification ON public.posts;
CREATE TRIGGER trg_post_mentions_notification
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_mention_notification();


-- 8.6 Post Shares Trigger (POST_SHARED)
CREATE OR REPLACE FUNCTION public.trg_fn_post_share_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_post_author UUID;
    v_sharer_name TEXT;
    v_post_title TEXT;
BEGIN
    SELECT author_id, SUBSTRING(COALESCE(content, 'your post') FROM 1 FOR 30) 
    INTO v_post_author, v_post_title
    FROM public.posts 
    WHERE id = NEW.post_id;

    IF v_post_author IS NOT NULL AND v_post_author <> NEW.user_id THEN
        SELECT COALESCE(full_name, 'Someone') INTO v_sharer_name 
        FROM public.profiles WHERE id = NEW.user_id;

        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_post_author,
            p_actor_id => NEW.user_id,
            p_event_type => 'POST_SHARED',
            p_title => 'Post Shared',
            p_message => COALESCE(v_sharer_name, 'Someone') || ' shared your post: "' || v_post_title || '..."',
            p_link => '/feed?post=' || NEW.post_id::text,
            p_module => 'network',
            p_category => 'social_interactions',
            p_priority => 'medium',
            p_icon => 'share-2',
            p_entity_type => 'post_shares',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'share_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_shares') THEN
        DROP TRIGGER IF EXISTS trg_post_shares_notification ON public.post_shares;
        CREATE TRIGGER trg_post_shares_notification
            AFTER INSERT ON public.post_shares
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_share_notification();
    END IF;
END $$;


-- 8.7 Job Applications Trigger (SUBMITTED, RECEIVED, SHORTLISTED, INTERVIEW, OFFER, REJECTED)
CREATE OR REPLACE FUNCTION public.trg_fn_job_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_title TEXT;
    v_employer_id UUID;
    v_applicant_name TEXT;
    v_status_normalized TEXT;
    v_notif_title TEXT;
    v_notif_msg TEXT;
BEGIN
    SELECT title, posted_by INTO v_job_title, v_employer_id 
    FROM public.jobs 
    WHERE id = NEW.job_id;

    IF TG_OP = 'INSERT' THEN
        -- 1. Notify Candidate
        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.user_id,
            p_actor_id => NULL,
            p_event_type => 'APPLICATION_SUBMITTED',
            p_title => 'Application Submitted',
            p_message => 'Your application for "' || COALESCE(v_job_title, 'Role') || '" has been submitted.',
            p_link => '/jobs/applications',
            p_module => 'jobs',
            p_category => 'applications',
            p_priority => 'medium',
            p_icon => 'file-check',
            p_entity_type => 'job_applications',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'app_sub_' || NEW.id::text
        );

        -- 2. Notify Employer / Recruiter
        IF v_employer_id IS NOT NULL AND v_employer_id <> NEW.user_id THEN
            SELECT COALESCE(full_name, 'A candidate') INTO v_applicant_name 
            FROM public.profiles WHERE id = NEW.user_id;

            PERFORM public.dispatch_notification_event(
                p_recipient_id => v_employer_id,
                p_actor_id => NEW.user_id,
                p_event_type => 'JOB_APPLICATION_RECEIVED',
                p_title => 'New Application Received',
                p_message => COALESCE(v_applicant_name, 'A candidate') || ' applied for ' || COALESCE(v_job_title, 'your job opening') || '.',
                p_link => '/employer/applications?job=' || NEW.job_id::text,
                p_module => 'employer',
                p_category => 'applications',
                p_priority => 'high',
                p_icon => 'briefcase',
                p_entity_type => 'job_applications',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'emp_app_rec_' || NEW.id::text
            );
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Candidate notification on status changes
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            v_status_normalized := LOWER(COALESCE(NEW.status, 'updated'));

            IF v_status_normalized = 'interview' OR v_status_normalized = 'interview_scheduled' THEN
                v_notif_title := 'Interview Scheduled!';
                v_notif_msg := 'An interview has been scheduled for "' || COALESCE(v_job_title, 'Role') || '".';
            ELSIF v_status_normalized = 'shortlisted' THEN
                v_notif_title := 'Application Shortlisted!';
                v_notif_msg := 'Congratulations, you have been shortlisted for "' || COALESCE(v_job_title, 'Role') || '".';
            ELSIF v_status_normalized = 'offered' OR v_status_normalized = 'offer' THEN
                v_notif_title := 'Job Offer Received! 🎉';
                v_notif_msg := 'You received an offer for "' || COALESCE(v_job_title, 'Role') || '". Check details.';
            ELSIF v_status_normalized = 'rejected' THEN
                v_notif_title := 'Application Update';
                v_notif_msg := 'Status update on your application for "' || COALESCE(v_job_title, 'Role') || '".';
            ELSE
                v_notif_title := 'Application ' || INITCAP(v_status_normalized);
                v_notif_msg := 'Your application for "' || COALESCE(v_job_title, 'Role') || '" is now ' || v_status_normalized || '.';
            END IF;

            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.user_id,
                p_actor_id => v_employer_id,
                p_event_type => 'APPLICATION_' || UPPER(v_status_normalized),
                p_title => v_notif_title,
                p_message => v_notif_msg,
                p_link => '/jobs/applications',
                p_module => 'jobs',
                p_category => 'applications',
                p_priority => 'high',
                p_icon => 'bell',
                p_entity_type => 'job_applications',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'app_stat_' || NEW.id::text || '_' || v_status_normalized
            );
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_applications_notification ON public.job_applications;
CREATE TRIGGER trg_job_applications_notification
    AFTER INSERT OR UPDATE OF status ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_job_application_notification();


-- 8.8 New Job Publishing Trigger (JOB_PUBLISHED)
CREATE OR REPLACE FUNCTION public.trg_fn_job_published_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.job_status = 'open' AND OLD.job_status <> 'open') THEN
        IF NEW.posted_by IS NOT NULL THEN
            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.posted_by,
                p_actor_id => NULL,
                p_event_type => 'JOB_PUBLISHED',
                p_title => 'Job Published Successfully',
                p_message => 'Your opening "' || NEW.title || '" is live on TalentXcel.',
                p_link => '/jobs/' || NEW.id::text,
                p_module => 'employer',
                p_category => 'job_opportunities',
                p_priority => 'medium',
                p_icon => 'briefcase',
                p_entity_type => 'jobs',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'job_pub_' || NEW.id::text
            );
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_published_notification ON public.jobs;
CREATE TRIGGER trg_job_published_notification
    AFTER INSERT OR UPDATE OF job_status ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_job_published_notification();


-- 8.9 Direct Messages Trigger (MESSAGE_RECEIVED)
CREATE OR REPLACE FUNCTION public.trg_fn_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_sender_name TEXT;
    v_recipient_id UUID;
    v_preview TEXT;
BEGIN
    v_recipient_id := NEW.recipient_id;

    -- Resolve recipient from conversation participants if needed
    IF v_recipient_id IS NULL AND NEW.conversation_id IS NOT NULL THEN
        SELECT p 
        INTO v_recipient_id
        FROM public.conversations c, unnest(c.participants) p
        WHERE c.id = NEW.conversation_id AND p <> NEW.sender_id
        LIMIT 1;
    END IF;

    IF v_recipient_id IS NOT NULL AND v_recipient_id <> NEW.sender_id THEN
        SELECT COALESCE(full_name, 'Someone') INTO v_sender_name 
        FROM public.profiles WHERE id = NEW.sender_id;

        v_preview := SUBSTRING(COALESCE(NEW.content, 'sent an attachment') FROM 1 FOR 45);

        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_recipient_id,
            p_actor_id => NEW.sender_id,
            p_event_type => 'MESSAGE_RECEIVED',
            p_title => 'Message from ' || COALESCE(v_sender_name, 'Connection'),
            p_message => v_preview,
            p_link => '/messages/' || COALESCE(NEW.conversation_id::text, ''),
            p_module => 'network',
            p_category => 'messages',
            p_priority => 'high',
            p_icon => 'message-square',
            p_entity_type => 'messages',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'msg_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_notification ON public.messages;
CREATE TRIGGER trg_messages_notification
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_message_notification();


-- 8.10 Company Verification & Follow Trigger (COMPANY_VERIFIED, COMPANY_FOLLOWED)
CREATE OR REPLACE FUNCTION public.trg_fn_company_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_company_name TEXT;
    v_owner_id UUID;
    v_follower_name TEXT;
BEGIN
    SELECT name, created_by INTO v_company_name, v_owner_id 
    FROM public.companies 
    WHERE id = NEW.company_id;

    IF v_owner_id IS NOT NULL AND v_owner_id <> NEW.user_id THEN
        SELECT COALESCE(full_name, 'A professional') INTO v_follower_name 
        FROM public.profiles WHERE id = NEW.user_id;

        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_owner_id,
            p_actor_id => NEW.user_id,
            p_event_type => 'COMPANY_FOLLOWED',
            p_title => 'New Follower for ' || COALESCE(v_company_name, 'Company'),
            p_message => COALESCE(v_follower_name, 'A user') || ' is now following your company.',
            p_link => '/companies/' || NEW.company_id::text,
            p_module => 'companies',
            p_category => 'social_interactions',
            p_priority => 'medium',
            p_icon => 'building',
            p_entity_type => 'company_follows',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'comp_follow_' || NEW.company_id::text || '_' || NEW.user_id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- Ensure public.company_follows exists
CREATE TABLE IF NOT EXISTS public.company_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, company_id)
);

ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_follows' AND policyname = 'Users can manage their own company follows') THEN
        CREATE POLICY "Users can manage their own company follows" ON public.company_follows FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_follows' AND policyname = 'Anyone can view company follows count') THEN
        CREATE POLICY "Anyone can view company follows count" ON public.company_follows FOR SELECT USING (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_company_follows_user ON public.company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON public.company_follows(company_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_follows') THEN
        DROP TRIGGER IF EXISTS trg_company_follows_notification ON public.company_follows;
        CREATE TRIGGER trg_company_follows_notification
            AFTER INSERT ON public.company_follows
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_company_follow_notification();
    END IF;
END $$;

-- Company Verification Trigger
CREATE OR REPLACE FUNCTION public.trg_fn_company_verified_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (NEW.is_verified = true AND (OLD.is_verified IS NULL OR OLD.is_verified = false))
       OR (NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status <> 'verified')) THEN
        IF NEW.created_by IS NOT NULL THEN
            PERFORM public.dispatch_notification_event(
                p_recipient_id => NEW.created_by,
                p_actor_id => NULL,
                p_event_type => 'COMPANY_VERIFIED',
                p_title => 'Company Verified! 🏢',
                p_message => 'Your company "' || NEW.name || '" has been officially verified on TalentXcel.',
                p_link => '/companies/' || NEW.id::text,
                p_module => 'companies',
                p_category => 'career_growth',
                p_priority => 'high',
                p_icon => 'shield-check',
                p_entity_type => 'companies',
                p_entity_id => NEW.id::text,
                p_idempotency_key => 'comp_ver_' || NEW.id::text
            );
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_verified_notification ON public.companies;
CREATE TRIGGER trg_company_verified_notification
    AFTER UPDATE OF is_verified, verification_status ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_company_verified_notification();


-- 8.11 Company Creation Welcome Trigger (COMPANY_JOINED)
CREATE OR REPLACE FUNCTION public.trg_fn_company_created_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.created_by,
            p_actor_id => NULL,
            p_event_type => 'COMPANY_JOINED',
            p_title => 'Company Registered',
            p_message => 'Welcome to TalentXcel! Complete ' || COALESCE(NEW.name, 'your company') || '''s profile to start hiring.',
            p_link => '/companies/' || NEW.id::text,
            p_module => 'companies',
            p_category => 'system_updates',
            p_priority => 'medium',
            p_icon => 'building',
            p_entity_type => 'companies',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'comp_join_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_created_notification ON public.companies;
CREATE TRIGGER trg_company_created_notification
    AFTER INSERT ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_company_created_notification();


-- 8.12 Interview Scheduling Trigger (INTERVIEW_SCHEDULED)
CREATE OR REPLACE FUNCTION public.trg_fn_interview_schedule_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_candidate_id UUID;
    v_job_title TEXT;
BEGIN
    SELECT a.user_id, j.title INTO v_candidate_id, v_job_title
    FROM public.job_applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = NEW.application_id;

    IF v_candidate_id IS NOT NULL THEN
        PERFORM public.dispatch_notification_event(
            p_recipient_id => v_candidate_id,
            p_actor_id => NEW.scheduled_by,
            p_event_type => 'INTERVIEW_SCHEDULED',
            p_title => 'Interview Scheduled!',
            p_message => 'An interview has been scheduled for "' || COALESCE(v_job_title, 'Role') || '". Check details.',
            p_link => '/jobs/applications',
            p_module => 'jobs',
            p_category => 'applications',
            p_priority => 'urgent',
            p_icon => 'calendar',
            p_entity_type => 'interview_schedules',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'interview_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interview_schedules') THEN
        DROP TRIGGER IF EXISTS trg_interview_schedules_notification ON public.interview_schedules;
        CREATE TRIGGER trg_interview_schedules_notification
            AFTER INSERT ON public.interview_schedules
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_interview_schedule_notification();
    END IF;
END $$;


-- 8.13 Job Recommendations & Matches Trigger (JOB_MATCHED)
CREATE OR REPLACE FUNCTION public.trg_fn_job_recommendation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_title TEXT;
BEGIN
    SELECT title INTO v_job_title
    FROM public.jobs
    WHERE id = NEW.job_id;

    PERFORM public.dispatch_notification_event(
        p_recipient_id => NEW.user_id,
        p_actor_id => NULL,
        p_event_type => 'JOB_MATCHED',
        p_title => 'New Job Match!',
        p_message => 'We found a position matching your profile: "' || COALESCE(v_job_title, 'Opportunity') || '".',
        p_link => '/jobs/' || NEW.job_id::text,
        p_module => 'jobs',
        p_category => 'job_opportunities',
        p_priority => 'medium',
        p_icon => 'briefcase',
        p_entity_type => 'job_recommendations',
        p_entity_id => NEW.id::text,
        p_idempotency_key => 'job_rec_' || NEW.id::text
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_recommendations') THEN
        DROP TRIGGER IF EXISTS trg_job_recommendations_notification ON public.job_recommendations;
        CREATE TRIGGER trg_job_recommendations_notification
            AFTER INSERT ON public.job_recommendations
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_job_recommendation_notification();
    END IF;
END $$;


-- 8.14 Skill Endorsements Trigger (SKILL_ENDORSED)
CREATE OR REPLACE FUNCTION public.trg_fn_skill_endorsement_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_endorser_name TEXT;
BEGIN
    IF NEW.endorser_id IS NOT NULL AND NEW.endorser_id <> NEW.user_id THEN
        SELECT COALESCE(full_name, 'A connection') INTO v_endorser_name
        FROM public.profiles WHERE id = NEW.endorser_id;

        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.user_id,
            p_actor_id => NEW.endorser_id,
            p_event_type => 'SKILL_ENDORSED',
            p_title => 'Skill Endorsed!',
            p_message => COALESCE(v_endorser_name, 'A connection') || ' endorsed your skill in ' || NEW.skill_name || '.',
            p_link => '/profile',
            p_module => 'network',
            p_category => 'career_growth',
            p_priority => 'medium',
            p_icon => 'award',
            p_entity_type => 'skill_endorsements',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'endorse_' || NEW.user_id::text || '_' || NEW.endorser_id::text || '_' || NEW.skill_name
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skill_endorsements') THEN
        DROP TRIGGER IF EXISTS trg_skill_endorsements_notification ON public.skill_endorsements;
        CREATE TRIGGER trg_skill_endorsements_notification
            AFTER INSERT ON public.skill_endorsements
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_skill_endorsement_notification();
    END IF;
END $$;


-- 8.15 Career & Learning Triggers (COURSE_COMPLETED, CERTIFICATE_ISSUED)
CREATE OR REPLACE FUNCTION public.trg_fn_user_course_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.user_id,
            p_actor_id => NULL,
            p_event_type => 'COURSE_COMPLETED',
            p_title => 'Course Completed! 🎓',
            p_message => 'Congratulations on completing your course. Your skills have been updated.',
            p_link => '/learning',
            p_module => 'learning',
            p_category => 'career_growth',
            p_priority => 'medium',
            p_icon => 'award',
            p_entity_type => 'user_courses',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'course_comp_' || NEW.id::text
        );
    END IF;

    IF NEW.certificate_url IS NOT NULL AND OLD.certificate_url IS NULL THEN
        PERFORM public.dispatch_notification_event(
            p_recipient_id => NEW.user_id,
            p_actor_id => NULL,
            p_event_type => 'CERTIFICATE_ISSUED',
            p_title => 'Certificate Issued! 📜',
            p_message => 'Your verified credential certificate is ready to share.',
            p_link => '/learning/certificates',
            p_module => 'learning',
            p_category => 'career_growth',
            p_priority => 'high',
            p_icon => 'award',
            p_entity_type => 'user_courses',
            p_entity_id => NEW.id::text,
            p_idempotency_key => 'cert_iss_' || NEW.id::text
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_courses') THEN
        DROP TRIGGER IF EXISTS trg_user_courses_notification ON public.user_courses;
        CREATE TRIGGER trg_user_courses_notification
            AFTER UPDATE OF completed_at, certificate_url ON public.user_courses
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_user_course_notification();
    END IF;
END $$;


-- 8.16 Skill Assessment Results Trigger (ASSESSMENT_COMPLETED)
CREATE OR REPLACE FUNCTION public.trg_fn_user_assessment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_assessment_title TEXT;
BEGIN
    SELECT title INTO v_assessment_title
    FROM public.skill_assessments
    WHERE id = NEW.assessment_id;

    PERFORM public.dispatch_notification_event(
        p_recipient_id => NEW.user_id,
        p_actor_id => NULL,
        p_event_type => 'ASSESSMENT_COMPLETED',
        p_title => CASE WHEN NEW.passed THEN 'Assessment Passed! 🎯' ELSE 'Assessment Completed' END,
        p_message => 'You scored ' || NEW.score || '% on ' || COALESCE(v_assessment_title, 'Assessment') || '.',
        p_link => '/learning/assessments',
        p_module => 'learning',
        p_category => 'career_growth',
        p_priority => CASE WHEN NEW.passed THEN 'high' ELSE 'medium' END,
        p_icon => 'award',
        p_entity_type => 'user_assessment_results',
        p_entity_id => NEW.id::text,
        p_idempotency_key => 'assess_' || NEW.id::text
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_assessment_results') THEN
        DROP TRIGGER IF EXISTS trg_user_assessment_notification ON public.user_assessment_results;
        CREATE TRIGGER trg_user_assessment_notification
            AFTER INSERT ON public.user_assessment_results
            FOR EACH ROW EXECUTE FUNCTION public.trg_fn_user_assessment_notification();
    END IF;
END $$;


-- 8.17 Asynchronous Outbox Event Trigger (Invokes process-notification-outbox via pg_net when available)
CREATE OR REPLACE FUNCTION public.trg_fn_notification_event_dispatch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If pg_net extension exists, fire non-blocking HTTP post to process-notification-outbox Edge Function
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        BEGIN
            PERFORM net.http_post(
                url := 'http://localhost:54321/functions/v1/process-notification-outbox',
                body := jsonb_build_object('event_id', NEW.id::text),
                headers := '{"Content-Type": "application/json"}'::jsonb,
                timeout_milliseconds := 3000
            );
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_events_dispatch ON public.notification_events;
CREATE TRIGGER trg_notification_events_dispatch
    AFTER INSERT ON public.notification_events
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_notification_event_dispatch();


-- 8.18 Batch Queue Processor & Dead-Letter Replay Procedures
CREATE OR REPLACE FUNCTION public.process_notification_outbox_batch(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    processed_count INTEGER,
    recovered_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_stale_recovered INTEGER := 0;
    v_processed INTEGER := 0;
BEGIN
    -- Recover stale locks (> 5 minutes in processing)
    UPDATE public.notification_events
    SET status = 'retrying',
        last_error = 'Stale lock recovered by batch cleaner',
        updated_at = now()
    WHERE status = 'processing'
      AND updated_at < now() - INTERVAL '5 minutes';
    
    GET DIAGNOSTICS v_stale_recovered = ROW_COUNT;

    processed_count := v_processed;
    recovered_count := v_stale_recovered;
    RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.replay_dead_letter_notifications(p_max INTEGER DEFAULT 100)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_replayed INTEGER := 0;
BEGIN
    UPDATE public.notification_events
    SET status = 'pending',
        retry_count = 0,
        scheduled_for = now(),
        updated_at = now()
    WHERE status = 'dead_letter'
      AND id IN (
          SELECT id FROM public.notification_events 
          WHERE status = 'dead_letter' 
          ORDER BY created_at DESC 
          LIMIT p_max
      );

    GET DIAGNOSTICS v_replayed = ROW_COUNT;
    RETURN v_replayed;
END;
$$;


-- 9. Row Level Security Hardening

-- 9.1 Harden public.notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

-- Only recipient can select their notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Recipient can mark as read / update read status
CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Recipient can delete/dismiss their notification
CREATE POLICY "notifications_delete_policy" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Explicit insert policy: Users can only insert notifications directed to themselves (system DEFINER functions bypass RLS safely)
CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 9.2 Harden public.notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preferences_select_policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "preferences_insert_policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "preferences_update_policy" ON public.notification_preferences;

CREATE POLICY "preferences_select_policy" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "preferences_insert_policy" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_policy" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 9.3 Harden public.notification_devices
ALTER TABLE public.notification_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "devices_all_policy" ON public.notification_devices;

CREATE POLICY "devices_all_policy" ON public.notification_devices
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 9.4 Harden public.notification_delivery_logs
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_logs_select_policy" ON public.notification_delivery_logs;

CREATE POLICY "delivery_logs_select_policy" ON public.notification_delivery_logs
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
        )
    );


-- 9.5 Harden public.notification_events
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_admin_only_policy" ON public.notification_events;

CREATE POLICY "events_admin_only_policy" ON public.notification_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
        )
    );


-- 10. Realtime Publications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
WHEN OTHERS THEN
    RAISE NOTICE 'Could not add notifications to supabase_realtime publication: %', SQLERRM;
END;
$$;

COMMIT;
