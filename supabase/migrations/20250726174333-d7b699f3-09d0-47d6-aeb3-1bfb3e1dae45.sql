-- Phase 3: Fix Critical Security Warnings

-- First, fix all function search paths by adding secure search_path settings
-- This prevents SQL injection attacks through search path manipulation

-- Update all existing functions to have secure search paths
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Get all functions in the public schema that need search path fixes
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'system_%'
    LOOP
        -- Add search_path = '' to all functions for security
        EXECUTE format(
            'ALTER FUNCTION %I.%I(%s) SET search_path = ''''',
            func_record.schema_name,
            func_record.function_name,
            func_record.args
        );
    END LOOP;
END $$;

-- Fix specific database column issues mentioned in logs
-- Add missing description column to security_events if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'security_events' AND column_name = 'description'
    ) THEN
        -- Create security_events table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.security_events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type text NOT NULL,
            severity text DEFAULT 'medium',
            description text,
            metadata jsonb DEFAULT '{}',
            user_id uuid,
            ip_address inet,
            user_agent text,
            created_at timestamp with time zone DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
        
        -- Create secure policies
        CREATE POLICY "Admins can manage security events"
        ON public.security_events
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = ANY(ARRAY['super_admin'::app_role, 'admin'::app_role])
                AND is_active = true
            )
        );
        
        CREATE POLICY "System can insert security events"
        ON public.security_events
        FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Create secure admin function for checking roles
CREATE OR REPLACE FUNCTION public.is_app_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid
      AND role = ANY(ARRAY['super_admin'::public.app_role, 'admin'::public.app_role])
      AND is_active = true
  );
$function$;

-- Update anonymous access policies to be more restrictive
-- Remove overly permissive anonymous access where appropriate

-- Update AI tools config to restrict anonymous access
DROP POLICY IF EXISTS "Anyone can view enabled AI tools" ON public.ai_tools_config;
CREATE POLICY "Authenticated users can view enabled AI tools"
ON public.ai_tools_config
FOR SELECT
TO authenticated
USING (is_enabled = true);

-- Update AI features status to restrict anonymous access  
DROP POLICY IF EXISTS "Users can view AI features status" ON public.ai_features_status;
CREATE POLICY "Authenticated users can view AI features status"
ON public.ai_features_status
FOR SELECT
TO authenticated
USING (true);

-- Update companies table to require authentication for viewing
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

-- Update jobs table policies (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
        -- Drop overly permissive policies
        DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
        
        -- Create more restrictive policy
        CREATE POLICY "Authenticated users can view active jobs"
        ON public.jobs
        FOR SELECT
        TO authenticated
        USING (is_active = true);
    END IF;
END $$;

-- Update content policies to be more restrictive
DROP POLICY IF EXISTS "Public can view content flags" ON public.admin_content_flags;
CREATE POLICY "Authenticated users can view content flags"
ON public.admin_content_flags
FOR SELECT
TO authenticated
USING (true);

-- Update colleges table to require authentication
DROP POLICY IF EXISTS "Anyone can view active colleges" ON public.colleges;
CREATE POLICY "Authenticated users can view active colleges"
ON public.colleges
FOR SELECT
TO authenticated
USING (is_active = true);

-- Create function to clean up old security events
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.security_events 
  WHERE created_at < now() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;