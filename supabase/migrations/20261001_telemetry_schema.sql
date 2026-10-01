-- Analytics Telemetry Schema for TalentXcel Growth Funnel
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    device_type TEXT,
    source TEXT,
    path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast funnel queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time 
ON public.analytics_events(event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user 
ON public.analytics_events(user_id, created_at);

-- RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert events
CREATE POLICY "Anyone can insert events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

-- Only service role / admins can view events
CREATE POLICY "Only admins can view events" 
ON public.analytics_events FOR SELECT 
USING (auth.jwt() ->> 'role' = 'service_role');
