-- Enhanced Email Automation System for Global Competition

-- User Behavior Tracking Table
CREATE TABLE IF NOT EXISTS public.user_behavior_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- page_view, email_open, click, download, etc.
    event_category TEXT NOT NULL, -- engagement, conversion, retention
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B Testing Framework
CREATE TABLE IF NOT EXISTS public.email_ab_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    variant_a_subject TEXT NOT NULL,
    variant_b_subject TEXT NOT NULL,
    variant_a_content TEXT NOT NULL,
    variant_b_content TEXT NOT NULL,
    traffic_split INTEGER DEFAULT 50, -- percentage for variant A
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    winning_variant TEXT, -- 'a' or 'b'
    confidence_level DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B Test Results Tracking
CREATE TABLE IF NOT EXISTS public.email_ab_test_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.email_ab_tests(id) ON DELETE CASCADE,
    variant TEXT NOT NULL, -- 'a' or 'b'
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced User Segmentation
CREATE TABLE IF NOT EXISTS public.dynamic_user_segments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- complex rules for auto-segmentation
    refresh_frequency TEXT DEFAULT 'daily', -- how often to recalculate
    last_calculated TIMESTAMP WITH TIME ZONE,
    user_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Segment Membership (calculated automatically)
CREATE TABLE IF NOT EXISTS public.user_segment_membership (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    segment_id UUID NOT NULL REFERENCES public.dynamic_user_segments(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    score DECIMAL DEFAULT 0, -- how well they match the segment
    UNIQUE(user_id, segment_id)
);

-- Predictive Analytics Data
CREATE TABLE IF NOT EXISTS public.user_predictions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    prediction_type TEXT NOT NULL, -- churn_risk, conversion_likelihood, engagement_score
    prediction_value DECIMAL NOT NULL,
    confidence_score DECIMAL NOT NULL,
    factors JSONB, -- what influenced this prediction
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Performance Analytics
CREATE TABLE IF NOT EXISTS public.email_performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id UUID, -- reference to email_automation_queue
    template_type TEXT NOT NULL,
    sent_date DATE NOT NULL,
    total_sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0,
    bounced INTEGER DEFAULT 0,
    unsubscribed INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    revenue_generated DECIMAL DEFAULT 0,
    open_rate DECIMAL GENERATED ALWAYS AS (
        CASE WHEN delivered > 0 THEN (opened::DECIMAL / delivered) * 100 ELSE 0 END
    ) STORED,
    click_rate DECIMAL GENERATED ALWAYS AS (
        CASE WHEN opened > 0 THEN (clicked::DECIMAL / opened) * 100 ELSE 0 END
    ) STORED,
    conversion_rate DECIMAL GENERATED ALWAYS AS (
        CASE WHEN clicked > 0 THEN (converted::DECIMAL / clicked) * 100 ELSE 0 END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Smart Send Time Optimization
CREATE TABLE IF NOT EXISTS public.user_send_time_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    preferred_hour INTEGER, -- 0-23
    preferred_day_of_week INTEGER, -- 0-6 (Sunday = 0)
    timezone TEXT DEFAULT 'UTC',
    engagement_score_by_hour JSONB DEFAULT '{}', -- hour -> score mapping
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content Personalization Profiles
CREATE TABLE IF NOT EXISTS public.user_content_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    interests JSONB DEFAULT '[]', -- array of interests
    content_style TEXT DEFAULT 'professional', -- professional, casual, technical
    preferred_length TEXT DEFAULT 'medium', -- short, medium, long
    topics_engaged_with JSONB DEFAULT '{}', -- topic -> engagement_score
    last_engagement_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_user_id ON public.user_behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_type ON public.user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_created_at ON public.user_behavior_events(created_at);
CREATE INDEX IF NOT EXISTS idx_email_ab_test_results_test_id ON public.email_ab_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_membership_user_id ON public.user_segment_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_type ON public.user_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_email_performance_sent_date ON public.email_performance_metrics(sent_date);

-- Enable RLS on all tables
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segment_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_send_time_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user behavior events
CREATE POLICY "Users can view their own behavior events" ON public.user_behavior_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all behavior events" ON public.user_behavior_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

-- RLS Policies for A/B tests (admin only)
CREATE POLICY "Admins can manage A/B tests" ON public.email_ab_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can view A/B test results" ON public.email_ab_test_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

-- RLS Policies for segments (admin only)
CREATE POLICY "Admins can manage segments" ON public.dynamic_user_segments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

CREATE POLICY "Users can view their segment membership" ON public.user_segment_membership
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage segment membership" ON public.user_segment_membership
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

-- RLS Policies for predictions
CREATE POLICY "Users can view their predictions" ON public.user_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage predictions" ON public.user_predictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

-- RLS Policies for performance metrics (admin only)
CREATE POLICY "Admins can view performance metrics" ON public.email_performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

-- RLS Policies for send time preferences
CREATE POLICY "Users can manage their send time preferences" ON public.user_send_time_preferences
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for content preferences
CREATE POLICY "Users can manage their content preferences" ON public.user_content_preferences
    FOR ALL USING (auth.uid() = user_id);