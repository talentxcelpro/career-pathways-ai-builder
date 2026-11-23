-- ============================================================================
-- Migration Rollback: 20261123200000_exact_online_presence_and_last_seen_rollback.sql
-- Exact Online Presence, Heartbeat & Privacy Settings for TalentXcel Network
-- Platform: TalentXcel.in
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_batch_presence(UUID[]);
DROP FUNCTION IF EXISTS public.set_presence_visibility(TEXT);
DROP FUNCTION IF EXISTS public.record_presence_heartbeat(BOOLEAN, TEXT, TEXT, TEXT);

DROP INDEX IF EXISTS public.idx_profiles_presence_lookup;
DROP INDEX IF EXISTS public.idx_user_presence_heartbeat;

-- Restore standard update_user_presence without strict auth enforcement if rolled back
CREATE OR REPLACE FUNCTION public.update_user_presence(
  user_uuid UUID, 
  is_online_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_online = is_online_status,
    last_seen = CASE WHEN is_online_status = TRUE THEN NOW() ELSE last_seen END,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;
