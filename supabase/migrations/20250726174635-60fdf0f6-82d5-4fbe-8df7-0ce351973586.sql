-- Phase 3: Security fixes - simplified approach
-- Fix function search paths for all existing functions using ALTER FUNCTION SET

-- Fix the is_app_admin function specifically
ALTER FUNCTION public.is_app_admin(uuid) SET search_path = '';

-- Fix other critical functions with search path
DO $$
DECLARE
    func_record RECORD;
    sql_command TEXT;
BEGIN
    -- Update search paths for all public functions except those already done
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT IN ('is_app_admin') -- Skip already done
    LOOP
        BEGIN
            sql_command := format('ALTER FUNCTION public.%I(%s) SET search_path = ''''', 
                                func_record.function_name, 
                                func_record.args);
            EXECUTE sql_command;
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with other functions
            RAISE NOTICE 'Could not update function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Create security events table if it doesn't exist
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

-- Enable RLS if not already enabled
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events
DROP POLICY IF EXISTS "Admins can manage security events" ON public.security_events;
CREATE POLICY "Admins can manage security events"
ON public.security_events
FOR ALL
TO authenticated
USING (public.is_app_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type text,
    p_severity text DEFAULT 'medium',
    p_description text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}',
    p_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    event_id uuid;
BEGIN
    INSERT INTO public.security_events (
        event_type,
        severity,
        description,
        metadata,
        user_id,
        ip_address,
        user_agent
    ) VALUES (
        p_event_type,
        p_severity,
        p_description,
        p_metadata,
        COALESCE(p_user_id, auth.uid()),
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$function$;