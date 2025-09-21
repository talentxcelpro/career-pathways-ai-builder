-- Phase 1: Critical Database Security Fixes (Tables Only)
-- Fix 1: Create helper function for user validation
CREATE OR REPLACE FUNCTION public.get_current_user_or_admin()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.uid(),
    (SELECT user_id FROM public.user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1)
  );
$$;

-- Fix 2: Update existing admin validation function
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'moderator') 
    AND is_active = true
  );
$$;

-- Fix 3: Add missing RLS policies for agent_events table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agent_events' 
        AND policyname = 'Admins can manage agent events'
    ) THEN
        CREATE POLICY "Admins can manage agent events"
        ON public.agent_events
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
          )
        );
    END IF;
END $$;

-- Fix 4: Add missing RLS for agent_tools table if not exists  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agent_tools' 
        AND policyname = 'System can manage agent tools'
    ) THEN
        CREATE POLICY "System can manage agent tools"
        ON public.agent_tools
        FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;