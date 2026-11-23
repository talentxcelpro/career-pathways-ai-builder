-- Migration Rollback: 20261123210000_profile_visitor_analytics_rollback.sql
-- Description: Rollback Private Profile Visitor Analytics

DROP FUNCTION IF EXISTS public.record_profile_visit(uuid, text, text);
DROP FUNCTION IF EXISTS public.get_profile_visitors(int, int);

-- Revert RLS policy
DROP POLICY IF EXISTS "Profile owners can view visits to their profile" ON public.profile_views_v2;
DROP POLICY IF EXISTS "System and callers can insert profile views" ON public.profile_views_v2;

CREATE POLICY "Users can view their own profile views" 
ON public.profile_views_v2 
FOR SELECT 
USING (auth.uid() = profile_id OR auth.uid() = viewer_id);

CREATE POLICY "System can track profile views" 
ON public.profile_views_v2 
FOR INSERT 
WITH CHECK (true);

-- Drop new indexes
DROP INDEX IF EXISTS idx_profile_views_v2_owner_viewed_at;
DROP INDEX IF EXISTS idx_profile_views_v2_owner_viewer_viewed;
DROP INDEX IF EXISTS idx_profile_views_v2_dedup;

-- Drop foreign keys
ALTER TABLE public.profile_views_v2 DROP CONSTRAINT IF EXISTS fk_profile_views_v2_profile;
ALTER TABLE public.profile_views_v2 DROP CONSTRAINT IF EXISTS fk_profile_views_v2_viewer;
