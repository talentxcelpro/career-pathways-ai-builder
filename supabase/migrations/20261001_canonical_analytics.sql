-- Phase 3: Canonical Analytics Architecture Upgrade
-- Run this in the Supabase SQL Editor

-- 1. Upgrade user_behavior_events to support anonymous funnel tracking and UTMs
ALTER TABLE public.user_behavior_events 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add missing canonical columns
ALTER TABLE public.user_behavior_events
ADD COLUMN IF NOT EXISTS anonymous_session_id TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS intent TEXT,
ADD COLUMN IF NOT EXISTS user_role TEXT;

-- 3. Add fast query indexes for the funnel dashboard
CREATE INDEX IF NOT EXISTS idx_user_behavior_event_type ON public.user_behavior_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session ON public.user_behavior_events(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON public.user_behavior_events(user_id);

-- 4. Enable RLS (if not already enabled) and set Insert policy
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to insert events
DROP POLICY IF EXISTS "Anyone can insert events" ON public.user_behavior_events;
CREATE POLICY "Anyone can insert events" 
ON public.user_behavior_events FOR INSERT 
WITH CHECK (true);

-- Only admins/service role can view
DROP POLICY IF EXISTS "Only admins can view events" ON public.user_behavior_events;
CREATE POLICY "Only admins can view events" 
ON public.user_behavior_events FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin'
  )
);
