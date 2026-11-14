-- ============================================================================
-- Migration: 20261114140000_txc_network_phase1_security_remediation_rollback.sql
-- Module: TalentXcel Professional Network Security Hardening (Phase 1 Rollback)
-- Safety: Never restores USING (true) or permissive public bypass.
-- ============================================================================

-- Revert get_network_feed_v2 to basic safe definition
CREATE OR REPLACE FUNCTION public.get_network_feed_v2(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_feed_type TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Rollback safe stub: returns only published public posts
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb)
    FROM (
      SELECT * FROM public.posts
      WHERE status = 'published'
        AND (is_deleted IS NULL OR is_deleted = false)
        AND COALESCE(is_public, true) = true
        AND COALESCE(visibility, 'public') = 'public'
      ORDER BY created_at DESC
      LIMIT LEAST(p_limit, 50)
      OFFSET GREATEST(p_offset, 0)
    ) p
  );
END;
$$;

-- Ensure no unsafe policies are ever created
DROP POLICY IF EXISTS "Public read access" ON public.posts;
