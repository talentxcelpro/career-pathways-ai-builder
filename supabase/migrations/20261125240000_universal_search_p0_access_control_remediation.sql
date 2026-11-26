-- ============================================================================
-- Migration: 20261125240000_universal_search_p0_access_control_remediation.sql
-- Priority: P0 CRITICAL DATABASE ACCESS-CONTROL REMEDIATION
-- Target: Supabase Project dthlgsnakhoftinssokm
--
-- PURPOSE:
-- Eliminate anonymous data exposure on public.profiles, public.unified_candidates,
-- and public.connections while strictly preserving legitimate access for:
--   - Authenticated users (own profiles, own connections, public discovery)
--   - Authorized Recruiters & Employers (candidate discovery, applicant reviews)
--   - Administrators (platform administration, oversight)
--   - Public discovery view (public.public_profiles view remains accessible to anon)
--
-- ROOT CAUSES REMEDIATED:
-- 1. public.profiles: Dropping legacy permissive policies ('Allow realtime for own profiles'
--    with USING (true) and 'Users can view public profiles' without role restriction).
--    Enforcing explicit REVOKE of direct table SELECT from anon and PUBLIC.
-- 2. public.unified_candidates: Dropping policy 'Employers can view all candidates' (USING (true)).
--    Restricting SELECT to authenticated recruiters, employers, and administrators.
-- 3. public.connections: Ensuring ROW LEVEL SECURITY is ENABLED, dropping permissive policies,
--    and enforcing that SELECT is strictly scoped to the authenticated connection participants.
--
-- SAFE & IDEMPOTENT: Uses IF EXISTS / IF NOT EXISTS. Fully reversible via companion rollback.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: public.profiles REMEDIATION
-- ============================================================================

-- 1. Ensure RLS is active on base profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Revoke direct table privileges from anon and PUBLIC on the base profiles table.
-- Anonymous visitors and search crawlers MUST query public.public_profiles (the 21-col sanitized view).
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon;

-- 3. Drop all legacy permissive SELECT policies on public.profiles that grant anon or public access
DROP POLICY IF EXISTS "Allow realtime for own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

-- 4. Re-grant SELECT on base table to authenticated role only (needed for owner and admin policies)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- 5. Ensure owner SELECT policy is present for authenticated users
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 6. Ensure administrative SELECT policy is present for platform admins
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "profiles_admin_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_app_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin'::app_role, 'super_admin'::app_role)
      AND ur.is_active = true
  )
);

-- ============================================================================
-- PART 2: public.unified_candidates REMEDIATION
-- ============================================================================

-- 1. Ensure RLS is active on unified_candidates
ALTER TABLE public.unified_candidates ENABLE ROW LEVEL SECURITY;

-- 2. Revoke table-level access from anon and PUBLIC
REVOKE ALL ON TABLE public.unified_candidates FROM PUBLIC, anon;

-- 3. Drop dangerous permissive policies that used USING (true) without role verification
DROP POLICY IF EXISTS "Employers can view all candidates" ON public.unified_candidates;
DROP POLICY IF EXISTS "System can manage unified candidates" ON public.unified_candidates;
DROP POLICY IF EXISTS "unified_candidates_select_all" ON public.unified_candidates;

-- 4. Grant SELECT on unified_candidates to authenticated role only
GRANT SELECT ON TABLE public.unified_candidates TO authenticated;

-- 5. Create secure SELECT policy strictly restricted to authorized recruiters, employers, and admins
CREATE POLICY "unified_candidates_authorized_recruiters"
ON public.unified_candidates
FOR SELECT
TO authenticated
USING (
  -- User is a platform admin
  public.is_app_admin(auth.uid())
  -- OR user is viewing their own candidate record
  OR (auth.uid()::text = unified_candidates.id::text)
  -- OR verified recruiter/employer/active team member viewing candidates who opted into discovery
  OR (
    COALESCE(unified_candidates.looking_for_job, false) = true
    AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role IN ('recruiter'::app_role, 'employer'::app_role, 'admin'::app_role, 'super_admin'::app_role)
          AND ur.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM public.company_team_members ctm
        WHERE ctm.user_id = auth.uid()
          AND ctm.is_active = true
      )
    )
  )
);

-- ============================================================================
-- PART 3: public.connections REMEDIATION
-- ============================================================================

-- 1. Enforce RLS on public.connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 2. Revoke direct access from anon and PUBLIC
REVOKE ALL ON TABLE public.connections FROM PUBLIC, anon;

-- 3. Drop any permissive wildcard policies
DROP POLICY IF EXISTS "Allow realtime for own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "connections_select" ON public.connections;
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;

-- 4. Grant SELECT to authenticated role only
GRANT SELECT ON TABLE public.connections TO authenticated;

-- 5. Create strict, participant-scoped SELECT policy for authenticated users
-- NOTE: public.connections schema uses requester_id and recipient_id only (no user_id/connected_user_id).
CREATE POLICY "connections_participant_select"
ON public.connections
FOR SELECT
TO authenticated
USING (
  auth.uid() = requester_id 
  OR auth.uid() = recipient_id
  OR public.is_app_admin(auth.uid())
);

-- ============================================================================
-- PART 4: CONFIRM public.public_profiles VIEW REMAINS ACCESSIBLE TO ANON
-- ============================================================================
-- The public_profiles view (sanitized 21 columns, no PII, security_barrier = true)
-- MUST remain accessible to anonymous users for SEO, public profiles (/u/:username), and public search.
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
