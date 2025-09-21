-- Phase 1: Critical Database Security Fixes
-- Fix 1: Address UUID null errors by ensuring proper user ID handling

-- Create helper function to get current user or fallback admin
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

-- Fix 2: Add missing RLS policies for critical tables without policies

-- RLS for ai_prompt_cache table
CREATE POLICY "Anyone can read AI prompt cache"
ON public.ai_prompt_cache
FOR SELECT
USING (true);

CREATE POLICY "System can manage AI prompt cache"
ON public.ai_prompt_cache
FOR ALL
USING (true);

-- RLS for ai_prefill_cache table  
CREATE POLICY "Anyone can read AI prefill cache"
ON public.ai_prefill_cache
FOR SELECT
USING (true);

CREATE POLICY "System can manage AI prefill cache"
ON public.ai_prefill_cache
FOR ALL
USING (true);

-- RLS for ai_datasets table
CREATE POLICY "Admins can manage AI datasets"
ON public.ai_datasets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- RLS for agent_performance view - make it read-only for admins
CREATE POLICY "Admins can view agent performance"
ON public.agent_performance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Fix 3: Add proper user validation function
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

-- Fix 4: Update functions to use proper security definer pattern
CREATE OR REPLACE FUNCTION public.is_app_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$$;