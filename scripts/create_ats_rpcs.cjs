const helper = require('./db-audit-helper.cjs');

helper.setLinkedTarget('production');

const rpcSql = `
CREATE OR REPLACE FUNCTION public.save_public_ats_scan(
  p_session_fingerprint TEXT,
  p_target_role TEXT,
  p_raw_text TEXT,
  p_ats_score INTEGER,
  p_parse_metrics JSONB DEFAULT '{}'::jsonb,
  p_missing_keywords TEXT[] DEFAULT '{}'::text[],
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id UUID;
  v_uid UUID;
BEGIN
  v_uid := COALESCE(auth.uid(), p_user_id);

  INSERT INTO public.ats_public_scans (
    session_fingerprint,
    user_id,
    target_role,
    raw_text,
    ats_score,
    parse_metrics,
    missing_keywords
  ) VALUES (
    p_session_fingerprint,
    v_uid,
    p_target_role,
    p_raw_text,
    p_ats_score,
    COALESCE(p_parse_metrics, '{}'::jsonb),
    COALESCE(p_missing_keywords, '{}'::text[])
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_public_ats_scan(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[], UUID) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_ats_scan(
  p_scan_id UUID,
  p_session_fingerprint TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to claim scan';
  END IF;

  UPDATE public.ats_public_scans
  SET 
    user_id = v_uid,
    converted_at = now()
  WHERE id = p_scan_id
    AND (session_fingerprint = p_session_fingerprint OR user_id IS NULL OR user_id = v_uid);

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_ats_scan(UUID, TEXT) TO authenticated, service_role;
`;

const res = helper.runSql(rpcSql);
console.log('RPC creation result:', res);
