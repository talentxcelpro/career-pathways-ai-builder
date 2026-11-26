-- ============================================================================
-- Safe Migration Rollback: 20261125240000_universal_search_p0_access_control_remediation_rollback.sql
-- Module: TalentXcel Access Control Safe Rollback
-- Target: Supabase Project dthlgsnakhoftinssokm
--
-- SECURITY INVARIANT:
-- This rollback NEVER restores anonymous SELECT access or USING (true) policies
-- on public.profiles, public.unified_candidates, or public.connections.
-- It safely reverts policy names while preserving P0 privacy protections.
-- ============================================================================

BEGIN;

-- 1. Safe rollback for public.connections (preserves participant-only restriction, no anon grant)
DROP POLICY IF EXISTS "connections_participant_select" ON public.connections;
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- 2. Safe rollback for public.unified_candidates (preserves authenticated restriction, no USING (true))
DROP POLICY IF EXISTS "unified_candidates_authorized_recruiters" ON public.unified_candidates;
CREATE POLICY "unified_candidates_owner_select" ON public.unified_candidates
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR public.is_app_admin(auth.uid()));

-- 3. Safe rollback for public.profiles (preserves owner-only restriction, no anon grant)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

NOTIFY pgrst, 'reload schema';

COMMIT;
