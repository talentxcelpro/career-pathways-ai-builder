-- Fix security_events table to include missing description column
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS description TEXT;