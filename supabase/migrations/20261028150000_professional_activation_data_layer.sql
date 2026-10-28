-- =============================================================================
-- Migration: 20261028150000_professional_activation_data_layer.sql
-- Module: TalentXcel Professional Activation & Growth Data Layer
-- Description: Isolated staging architecture for external professional datasets,
--              single-use expiring claim token verification, and transaction-safe
--              claim mechanics without polluting auth.users or public.profiles.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. IMPORT BATCHES TRACKING TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('opt_in_list', 'event_attendees', 'partner_network', 'alumni_directory', 'corporate_directory', 'other')),
  legal_basis TEXT NOT NULL CHECK (legal_basis IN ('explicit_consent', 'legitimate_interest', 'pre_existing_relationship', 'pending_verification', 'suppressed')),
  file_name TEXT,
  total_records INT NOT NULL DEFAULT 0,
  valid_records INT NOT NULL DEFAULT 0,
  duplicate_records INT NOT NULL DEFAULT 0,
  suppressed_records INT NOT NULL DEFAULT 0,
  existing_user_matches INT NOT NULL DEFAULT 0,
  imported_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'validated', 'pilot_ready', 'active', 'completed', 'rolled_back')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. IMPORTED PROFESSIONALS STAGING TABLE (Isolated from canonical tables)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imported_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  
  -- Identity & Provenance
  source_identifier TEXT,
  email_raw TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  email_sha256 TEXT NOT NULL,
  phone_e164 TEXT,
  
  -- Professional Profile Attributes
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  headline TEXT,
  location_city TEXT,
  location_country TEXT DEFAULT 'India',
  years_experience NUMERIC(4, 1) DEFAULT 0,
  primary_skills TEXT[] DEFAULT '{}',
  current_company TEXT,
  linkedin_url TEXT,
  raw_attributes JSONB DEFAULT '{}'::jsonb,
  
  -- Governance & Legal Status
  legal_basis TEXT NOT NULL DEFAULT 'pending_verification' 
    CHECK (legal_basis IN ('explicit_consent', 'legitimate_interest', 'pre_existing_relationship', 'pending_verification', 'suppressed')),
  outreach_permitted BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  consent_source_url TEXT,
  
  -- Lifecycle & Activation Funnel Status
  status TEXT NOT NULL DEFAULT 'staged' 
    CHECK (status IN ('staged', 'eligible', 'invited', 'claimed', 'registered', 'verified', 'activated', 'suppressed', 'duplicate', 'ineligible')),
  suppression_reason TEXT,
  
  -- Cryptographic Profile Claim Mechanics
  claim_token_hash TEXT,                      -- SHA-256 of single-use token
  claim_token_expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  claimed_user_id UUID REFERENCES auth.users(id),
  
  -- Campaign History
  last_invited_at TIMESTAMPTZ,
  invitation_count INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_imported_email_per_batch UNIQUE (batch_id, email_normalized)
);

-- High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_imported_prof_email_norm ON public.imported_professionals(email_normalized);
CREATE INDEX IF NOT EXISTS idx_imported_prof_sha256 ON public.imported_professionals(email_sha256);
CREATE INDEX IF NOT EXISTS idx_imported_prof_status ON public.imported_professionals(status);
CREATE INDEX IF NOT EXISTS idx_imported_prof_claim_token ON public.imported_professionals(claim_token_hash) WHERE claim_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_imported_prof_batch ON public.imported_professionals(batch_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CLAIM AUDIT LOG (Security, Replay & Race-Condition Defense)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.claim_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_professional_id UUID REFERENCES public.imported_professionals(id) ON DELETE SET NULL,
  email_sha256 TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('token_verified', 'profile_claimed', 'token_expired', 'replay_attempted', 'account_collision', 'user_opt_out')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim_audit_sha256 ON public.claim_audit_log(email_sha256);
CREATE INDEX IF NOT EXISTS idx_claim_audit_user ON public.claim_audit_log(user_id) WHERE user_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. STRICT ROW LEVEL SECURITY (ZERO PUBLIC / ANONYMOUS EXPOSURE)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_audit_log ENABLE ROW LEVEL SECURITY;

-- Deny all public access. Granted ONLY to super_admins, admins, and service_role.
DROP POLICY IF EXISTS "Admins only access import_batches" ON public.import_batches;
CREATE POLICY "Admins only access import_batches"
  ON public.import_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admins only access imported_professionals" ON public.imported_professionals;
CREATE POLICY "Admins only access imported_professionals"
  ON public.imported_professionals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admins only access claim_audit_log" ON public.claim_audit_log;
CREATE POLICY "Admins only access claim_audit_log"
  ON public.claim_audit_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) OR auth.role() = 'service_role'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ATOMIC PROFILE CLAIM RPC FUNCTION (Transaction-Safe, Anti-Takeover)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_professional_profile(
  p_claim_token TEXT,
  p_target_user_id UUID,
  p_skills TEXT[] DEFAULT NULL,
  p_headline TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_years_experience NUMERIC DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_hash TEXT;
  v_record RECORD;
  v_existing_profile_id UUID;
BEGIN
  -- 1. Compute SHA-256 hash of presented raw token
  v_token_hash := encode(digest(p_claim_token, 'sha256'), 'hex');

  -- 2. Lock the imported_professionals row FOR UPDATE to defeat concurrent race conditions
  SELECT * INTO v_record
  FROM public.imported_professionals
  WHERE claim_token_hash = v_token_hash
  FOR UPDATE;

  -- 3. Validate Token Existence
  IF NOT FOUND THEN
    INSERT INTO public.claim_audit_log (email_sha256, event_type, ip_address, user_agent, metadata)
    VALUES ('unknown', 'replay_attempted', p_ip_address, p_user_agent, jsonb_build_object('token_hash', v_token_hash));
    
    RAISE EXCEPTION 'Invalid or already claimed verification token' USING ERRCODE = 'P0001';
  END IF;

  -- 4. Check Token Expiry
  IF v_record.claim_token_expires_at IS NOT NULL AND v_record.claim_token_expires_at < now() THEN
    INSERT INTO public.claim_audit_log (imported_professional_id, email_sha256, user_id, event_type, ip_address, user_agent)
    VALUES (v_record.id, v_record.email_sha256, p_target_user_id, 'token_expired', p_ip_address, p_user_agent);

    RAISE EXCEPTION 'Verification token has expired. Please request a fresh invitation.' USING ERRCODE = 'P0002';
  END IF;

  -- 5. Anti-Account-Takeover Defense:
  -- Caller must be authenticated as p_target_user_id OR call must originate from service_role
  IF auth.role() <> 'service_role' AND auth.uid() <> p_target_user_id THEN
    RAISE EXCEPTION 'Authorization failure: Caller is not authorized to claim on behalf of another user account' USING ERRCODE = '42501';
  END IF;

  -- Verify target user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_target_user_id) THEN
    RAISE EXCEPTION 'Target user account does not exist in authentication registry' USING ERRCODE = 'P0003';
  END IF;

  -- 6. Upsert Canonical Profile Row in public.profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    title,
    location,
    email,
    phone,
    skills,
    experience_years,
    current_company,
    linkedin_url,
    is_profile_public,
    looking_for_job,
    open_to_remote,
    updated_at
  ) VALUES (
    p_target_user_id,
    v_record.full_name,
    COALESCE(p_headline, v_record.headline, 'Professional'),
    COALESCE(p_location, v_record.location_city, 'India'),
    v_record.email_raw,
    v_record.phone_e164,
    COALESCE(p_skills, v_record.primary_skills, ARRAY[]::TEXT[]),
    COALESCE(p_years_experience, v_record.years_experience, 0),
    v_record.current_company,
    v_record.linkedin_url,
    true,
    true,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = COALESCE(EXCLUDED.title, public.profiles.title),
    location = COALESCE(EXCLUDED.location, public.profiles.location),
    skills = CASE 
      WHEN array_length(EXCLUDED.skills, 1) > 0 THEN EXCLUDED.skills 
      ELSE public.profiles.skills 
    END,
    experience_years = COALESCE(EXCLUDED.experience_years, public.profiles.experience_years),
    current_company = COALESCE(EXCLUDED.current_company, public.profiles.current_company),
    updated_at = now();

  -- 7. Atomically Update Staging Record & Clear Token (Single-Use Guarantee)
  UPDATE public.imported_professionals
  SET
    status = 'claimed',
    claimed_at = now(),
    claimed_user_id = p_target_user_id,
    claim_token_hash = NULL,            -- Token consumed; cannot be replayed
    updated_at = now()
  WHERE id = v_record.id;

  -- 8. Record Claim Audit Event
  INSERT INTO public.claim_audit_log (
    imported_professional_id,
    email_sha256,
    user_id,
    event_type,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    v_record.id,
    v_record.email_sha256,
    p_target_user_id,
    'profile_claimed',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'claimed_at', now(),
      'batch_id', v_record.batch_id,
      'full_name', v_record.full_name
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'claimed_at', now(),
    'user_id', p_target_user_id,
    'full_name', v_record.full_name,
    'email', v_record.email_raw
  );
END;
$$;
