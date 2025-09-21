-- Phase 1: Critical Database Security Fixes (Updated)
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

-- Fix 3: Add missing RLS policies for tables that don't have them yet
-- Check and add RLS for ai_operation_queue if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_operation_queue' 
        AND policyname = 'Admins can manage AI operations'
    ) THEN
        CREATE POLICY "Admins can manage AI operations"
        ON public.ai_operation_queue
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

-- Fix 4: Add RLS for agent_task_summary if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agent_task_summary' 
        AND policyname = 'Admins can view task summary'
    ) THEN
        CREATE POLICY "Admins can view task summary"
        ON public.agent_task_summary
        FOR SELECT
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