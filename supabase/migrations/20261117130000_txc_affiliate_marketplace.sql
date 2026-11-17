-- ============================================================================
-- Migration: 20261117130000_txc_affiliate_marketplace.sql
-- Description: Complete TalentXcel Affiliate Marketplace Architecture
-- Extends existing Refer & Earn identity (user_referrals, referral_code)
-- Server-enforced commission calculations, hybrid models, RLS & ledger audits.
-- ============================================================================

-- 1. AFFILIATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'suspended', 'rejected')),
  application_note TEXT,
  payout_method TEXT CHECK (payout_method IN ('upi', 'bank_transfer', 'credits')),
  payout_details JSONB DEFAULT '{}'::jsonb,
  total_earnings_paise BIGINT NOT NULL DEFAULT 0,
  pending_earnings_paise BIGINT NOT NULL DEFAULT 0,
  paid_earnings_paise BIGINT NOT NULL DEFAULT 0,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AFFILIATE PRODUCTS CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Subscription',
  badge TEXT,
  image_url TEXT,
  destination_path TEXT NOT NULL DEFAULT '/pricing',
  selling_price_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
  commission_rate NUMERIC NOT NULL,
  attribution_window_days INTEGER NOT NULL DEFAULT 30,
  refund_grace_days INTEGER NOT NULL DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT true,
  promotional_copy JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AFFILIATE CONVERSIONS (COMMISSION LEDGER) TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(user_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.affiliate_products(id) ON DELETE RESTRICT,
  order_id TEXT NOT NULL,
  payment_id TEXT UNIQUE NOT NULL,
  gross_amount_paise INTEGER NOT NULL,
  commission_amount_paise INTEGER NOT NULL,
  commission_type TEXT NOT NULL,
  commission_rate NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'payable', 'paid', 'reversed', 'rejected', 'cancelled')),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payable_after TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AFFILIATE CLICKS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.affiliate_products(id) ON DELETE SET NULL,
  campaign_id TEXT,
  visitor_id TEXT,
  channel TEXT DEFAULT 'direct',
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AFFILIATE PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(user_id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'processing', 'completed', 'rejected')),
  payout_method TEXT NOT NULL,
  payout_details JSONB NOT NULL,
  reference_number TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 6. INDEXES FOR PERFORMANCE & REPLAY DEFENSE
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON public.affiliate_profiles(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_slug ON public.affiliate_products(slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON public.affiliate_products(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_status ON public.affiliate_conversions(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_payment_id ON public.affiliate_conversions(payment_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_created ON public.affiliate_clicks(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON public.affiliate_payouts(affiliate_id, status);

-- 7. SEED REAL TALENTXCEL PRODUCTS
INSERT INTO public.affiliate_products (slug, name, description, category, badge, destination_path, selling_price_paise, commission_type, commission_rate, attribution_window_days, refund_grace_days, is_active, promotional_copy)
VALUES
  (
    'career-pro-sub',
    'Career Pro Subscription',
    'Unlock unlimited AI resume builds, smart job auto-match, verified recruiter badges, and full salary benchmarks.',
    'Subscription',
    'Most Popular',
    '/pricing',
    49900,
    'percentage',
    20.0,
    30,
    14,
    true,
    '{"headline": "Supercharge your career with TalentXcel Pro", "bullet_1": "100 AI Resume Scans & Tailoring", "bullet_2": "Verified Talent Passport badge", "bullet_3": "Priority Recruiter Direct Messaging"}'::jsonb
  ),
  (
    'career-premium-sub',
    'Career Premium / Max Tier',
    'Full access to Career RPG, executive network introductions, enterprise-grade salary intelligence, and VIP priority queue.',
    'Subscription',
    'High Earner',
    '/pricing',
    99900,
    'percentage',
    20.0,
    30,
    14,
    true,
    '{"headline": "Reach the top 1% with TalentXcel Premium", "bullet_1": "Exclusive Executive Job Match", "bullet_2": "Direct Interview Referrals", "bullet_3": "Unlimited Global Market Comparisons"}'::jsonb
  ),
  (
    'recruiter-os-license',
    'Recruiter OS Monthly License',
    'Candidate CRM, AI talent search, automated hiring pipelines, and direct messaging to 10,000+ verified professionals.',
    'Recruiter Tools',
    'Highest Commission',
    '/recruiters',
    249900,
    'percentage',
    15.0,
    45,
    14,
    true,
    '{"headline": "Scale your recruitment with Recruiter OS", "bullet_1": "Search 10,000+ verified candidates", "bullet_2": "Automated ATS pipeline management", "bullet_3": "Direct instant candidate reachout"}'::jsonb
  ),
  (
    'ats-resume-instant',
    'ATS Instant Resume Pass (One-off)',
    'Single high-precision ATS audit and downloadable tailored PDF resume with verified passport metadata.',
    'One-Off Tool',
    'Instant Convert',
    '/resume-builder',
    4900,
    'fixed',
    1500,
    30,
    7,
    true,
    '{"headline": "Pass ATS screening in 5 seconds", "bullet_1": "Instant Workday & Greenhouse compatibility test", "bullet_2": "Keyword gap auto-fill", "bullet_3": "One-click clean PDF export"}'::jsonb
  ),
  (
    'ai-credits-300',
    '300 AI Credits Booster Pack',
    'AI Credits pack for resume generation, skill verification, career coaching prompts, and cover letter tailoring.',
    'Credits Pack',
    'Quick Value',
    '/pricing',
    49900,
    'fixed',
    10000,
    30,
    7,
    true,
    '{"headline": "Fuel your AI career copilot with 300 credits", "bullet_1": "Full ATS checks & rewrites", "bullet_2": "AI interview preparation scripts", "bullet_3": "Never expires"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  destination_path = EXCLUDED.destination_path,
  selling_price_paise = EXCLUDED.selling_price_paise,
  commission_type = EXCLUDED.commission_type,
  commission_rate = EXCLUDED.commission_rate,
  attribution_window_days = EXCLUDED.attribution_window_days,
  refund_grace_days = EXCLUDED.refund_grace_days,
  is_active = EXCLUDED.is_active,
  promotional_copy = EXCLUDED.promotional_copy,
  updated_at = now();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Product Catalogue: Public read-only for active products; Admins full control
DROP POLICY IF EXISTS "Public read active affiliate products" ON public.affiliate_products;
CREATE POLICY "Public read active affiliate products"
ON public.affiliate_products
FOR SELECT
TO public
USING (is_active = true OR (auth.jwt()->>'role' = 'service_role'));

DROP POLICY IF EXISTS "Service role manage products" ON public.affiliate_products;
CREATE POLICY "Service role manage products"
ON public.affiliate_products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Affiliate Profiles: Users can view/create their own; Admins & service_role full control
DROP POLICY IF EXISTS "Users can view own affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can view own affiliate profile"
ON public.affiliate_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can apply for affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can apply for affiliate profile"
ON public.affiliate_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payout details" ON public.affiliate_profiles;
CREATE POLICY "Users can update own payout details"
ON public.affiliate_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full control profiles" ON public.affiliate_profiles;
CREATE POLICY "Service role full control profiles"
ON public.affiliate_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Affiliate Conversions: Affiliates can only view their own conversions
DROP POLICY IF EXISTS "Affiliates view own conversions" ON public.affiliate_conversions;
CREATE POLICY "Affiliates view own conversions"
ON public.affiliate_conversions
FOR SELECT
TO authenticated
USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Service role manage conversions" ON public.affiliate_conversions;
CREATE POLICY "Service role manage conversions"
ON public.affiliate_conversions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Affiliate Clicks: Affiliates can view their own clicks
DROP POLICY IF EXISTS "Affiliates view own clicks" ON public.affiliate_clicks;
CREATE POLICY "Affiliates view own clicks"
ON public.affiliate_clicks
FOR SELECT
TO authenticated
USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Public and service insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Public and service insert clicks"
ON public.affiliate_clicks
FOR INSERT
TO public
WITH CHECK (true);

-- Affiliate Payouts: Affiliates view/request own payouts
DROP POLICY IF EXISTS "Affiliates view own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates view own payouts"
ON public.affiliate_payouts
FOR SELECT
TO authenticated
USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Affiliates insert own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates insert own payouts"
ON public.affiliate_payouts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = affiliate_id AND status = 'requested');

DROP POLICY IF EXISTS "Service role manage payouts" ON public.affiliate_payouts;
CREATE POLICY "Service role manage payouts"
ON public.affiliate_payouts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 9. STORED PROCEDURES & SECURE RPCS
-- ============================================================================

-- A. Get or Create Affiliate Profile for Current User
CREATE OR REPLACE FUNCTION public.get_or_create_affiliate_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_code TEXT;
  v_profile RECORD;
  v_clicks_count BIGINT;
  v_conversions_count BIGINT;
  v_user_referrals_count INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Ensure user has a referral code in user_referrals
  SELECT referral_code, total_referrals INTO v_code, v_user_referrals_count
  FROM public.user_referrals
  WHERE referrer_id = v_uid;

  IF v_code IS NULL THEN
    v_code := 'TXC' || upper(substr(replace(v_uid::text, '-', ''), 1, 8));
    INSERT INTO public.user_referrals (referrer_id, referral_code, total_referrals, successful_referrals, is_active)
    VALUES (v_uid, v_code, 0, 0, true)
    ON CONFLICT (referral_code) DO NOTHING;
  END IF;

  -- Look up affiliate profile
  SELECT * INTO v_profile
  FROM public.affiliate_profiles
  WHERE user_id = v_uid;

  -- Auto-create profile if none exists (approved by default for existing verified network users)
  IF v_profile.user_id IS NULL THEN
    INSERT INTO public.affiliate_profiles (
      user_id,
      status,
      application_note,
      approved_at
    ) VALUES (
      v_uid,
      'approved',
      'Auto-approved via TalentXcel Network membership',
      now()
    )
    RETURNING * INTO v_profile;
  END IF;

  -- Count total clicks
  SELECT count(*) INTO v_clicks_count
  FROM public.affiliate_clicks
  WHERE affiliate_id = v_uid;

  -- Count total conversions
  SELECT count(*) INTO v_conversions_count
  FROM public.affiliate_conversions
  WHERE affiliate_id = v_uid;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_uid,
    'referral_code', v_code,
    'status', v_profile.status,
    'payout_method', v_profile.payout_method,
    'payout_details', v_profile.payout_details,
    'total_earnings_paise', v_profile.total_earnings_paise,
    'pending_earnings_paise', v_profile.pending_earnings_paise,
    'paid_earnings_paise', v_profile.paid_earnings_paise,
    'total_clicks', v_clicks_count,
    'total_conversions', v_conversions_count,
    'approved_at', v_profile.approved_at
  );
END;
$$;

-- B. Update Payout Settings
CREATE OR REPLACE FUNCTION public.update_affiliate_payout_settings(
  p_payout_method TEXT,
  p_payout_details JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  IF p_payout_method NOT IN ('upi', 'bank_transfer', 'credits') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid payout method');
  END IF;

  UPDATE public.affiliate_profiles
  SET 
    payout_method = p_payout_method,
    payout_details = p_payout_details,
    updated_at = now()
  WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'message', 'Payout settings updated successfully');
END;
$$;

-- C. Request Payout RPC (Threshold ₹1,000 / 100,000 paise)
CREATE OR REPLACE FUNCTION public.request_affiliate_payout(
  p_amount_paise BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_profile RECORD;
  v_payable_paise BIGINT;
  v_payout_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Minimum threshold: ₹1,000 (100,000 paise)
  IF p_amount_paise < 100000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum payout request is ₹1,000 (100,000 paise)');
  END IF;

  SELECT * INTO v_profile
  FROM public.affiliate_profiles
  WHERE user_id = v_uid;

  IF v_profile.user_id IS NULL OR v_profile.status <> 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only approved affiliates can request payouts');
  END IF;

  IF v_profile.payout_method IS NULL OR v_profile.payout_details IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please configure your payout details first');
  END IF;

  -- Calculate mature payable balance (past grace period)
  SELECT coalesce(sum(commission_amount_paise), 0) INTO v_payable_paise
  FROM public.affiliate_conversions
  WHERE affiliate_id = v_uid
    AND status IN ('approved', 'payable');

  IF p_amount_paise > v_payable_paise THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested amount exceeds currently payable earnings');
  END IF;

  -- Insert Payout Record
  INSERT INTO public.affiliate_payouts (
    affiliate_id,
    amount_paise,
    status,
    payout_method,
    payout_details
  ) VALUES (
    v_uid,
    p_amount_paise,
    'requested',
    v_profile.payout_method,
    v_profile.payout_details
  )
  RETURNING id INTO v_payout_id;

  RETURN jsonb_build_object(
    'success', true,
    'payout_id', v_payout_id,
    'amount_paise', p_amount_paise,
    'message', 'Payout request submitted successfully. Processing takes 2-3 business days.'
  );
END;
$$;

-- D. Server-Side Process Verified Purchase Commission (Service Role Only)
CREATE OR REPLACE FUNCTION public.process_affiliate_commission_atomic(
  p_payment_id TEXT,
  p_order_id TEXT,
  p_gross_paise INT,
  p_customer_id UUID,
  p_product_slug TEXT,
  p_referral_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_affiliate_id UUID;
  v_product RECORD;
  v_existing_conversion RECORD;
  v_calculated_commission INT;
  v_grace_days INT;
  v_payable_date TIMESTAMPTZ;
  v_conversion_id UUID;
BEGIN
  -- Strict input validation
  IF p_payment_id IS NULL OR p_order_id IS NULL OR p_referral_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required payment or attribution data');
  END IF;

  -- 1. Idempotency Check (Prevent duplicate commission per payment_id)
  SELECT id, status INTO v_existing_conversion
  FROM public.affiliate_conversions
  WHERE payment_id = p_payment_id;

  IF v_existing_conversion.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'is_replay', true, 'conversion_id', v_existing_conversion.id);
  END IF;

  -- 2. Resolve Referrer Identity from user_referrals
  SELECT referrer_id INTO v_affiliate_id
  FROM public.user_referrals
  WHERE referral_code = upper(trim(p_referral_code))
    AND is_active = true;

  IF v_affiliate_id IS NULL THEN
    -- Fallback check profiles.referral_code
    SELECT id INTO v_affiliate_id
    FROM public.profiles
    WHERE referral_code = upper(trim(p_referral_code));
  END IF;

  IF v_affiliate_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive referral code');
  END IF;

  -- 3. Anti-Self-Referral Gate (SEC-01)
  IF p_customer_id IS NOT NULL AND v_affiliate_id = p_customer_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Self-referral is strictly prohibited');
  END IF;

  -- 4. Look up Product from Catalogue (Never trust client commission values)
  SELECT * INTO v_product
  FROM public.affiliate_products
  WHERE slug = p_product_slug
    AND is_active = true;

  IF v_product.id IS NULL THEN
    -- Fallback: If no exact product slug passed, match by default subscription tier
    SELECT * INTO v_product
    FROM public.affiliate_products
    WHERE slug = 'career-pro-sub'
      AND is_active = true;
  END IF;

  IF v_product.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active affiliate product not found in catalogue');
  END IF;

  -- 5. Calculate Commission Server-Side
  IF v_product.commission_type = 'percentage' THEN
    -- e.g. 20% of gross
    v_calculated_commission := round((p_gross_paise * v_product.commission_rate) / 100.0);
  ELSIF v_product.commission_type = 'fixed' THEN
    -- fixed amount in paise
    v_calculated_commission := v_product.commission_rate::INT;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Unknown commission type');
  END IF;

  -- Ensure commission does not exceed gross amount
  IF v_calculated_commission > p_gross_paise THEN
    v_calculated_commission := p_gross_paise;
  END IF;

  v_grace_days := coalesce(v_product.refund_grace_days, 14);
  v_payable_date := now() + (v_grace_days || ' days')::interval;

  -- Ensure affiliate profile exists
  INSERT INTO public.affiliate_profiles (user_id, status, approved_at)
  VALUES (v_affiliate_id, 'approved', now())
  ON CONFLICT (user_id) DO NOTHING;

  -- 6. Insert Conversion Record into Ledger
  INSERT INTO public.affiliate_conversions (
    affiliate_id,
    product_id,
    order_id,
    payment_id,
    gross_amount_paise,
    commission_amount_paise,
    commission_type,
    commission_rate,
    status,
    customer_id,
    referral_code,
    attributed_at,
    payable_after
  ) VALUES (
    v_affiliate_id,
    v_product.id,
    p_order_id,
    p_payment_id,
    p_gross_paise,
    v_calculated_commission,
    v_product.commission_type,
    v_product.commission_rate,
    'pending',
    p_customer_id,
    upper(trim(p_referral_code)),
    now(),
    v_payable_date
  )
  RETURNING id INTO v_conversion_id;

  -- 7. Atomically Update Affiliate Profile Ledger
  UPDATE public.affiliate_profiles
  SET 
    total_earnings_paise = total_earnings_paise + v_calculated_commission,
    pending_earnings_paise = pending_earnings_paise + v_calculated_commission,
    updated_at = now()
  WHERE user_id = v_affiliate_id;

  RETURN jsonb_build_object(
    'success', true,
    'conversion_id', v_conversion_id,
    'affiliate_id', v_affiliate_id,
    'commission_amount_paise', v_calculated_commission,
    'commission_type', v_product.commission_type,
    'commission_rate', v_product.commission_rate,
    'payable_after', v_payable_date
  );
END;
$$;

-- E. Mature Conversions Routine (Transitions pending -> payable past grace period)
CREATE OR REPLACE FUNCTION public.mature_affiliate_conversions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  WITH matured AS (
    UPDATE public.affiliate_conversions
    SET status = 'payable'
    WHERE status = 'pending'
      AND payable_after <= now()
    RETURNING affiliate_id, commission_amount_paise
  )
  SELECT count(*) INTO v_count FROM matured;

  RETURN jsonb_build_object('success', true, 'matured_count', v_count);
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.get_or_create_affiliate_profile() FROM public;
GRANT EXECUTE ON FUNCTION public.get_or_create_affiliate_profile() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_affiliate_payout_settings(TEXT, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.update_affiliate_payout_settings(TEXT, JSONB) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.request_affiliate_payout(BIGINT) FROM public;
GRANT EXECUTE ON FUNCTION public.request_affiliate_payout(BIGINT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.process_affiliate_commission_atomic(TEXT, TEXT, INT, UUID, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.process_affiliate_commission_atomic(TEXT, TEXT, INT, UUID, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.mature_affiliate_conversions() FROM public;
GRANT EXECUTE ON FUNCTION public.mature_affiliate_conversions() TO service_role;
