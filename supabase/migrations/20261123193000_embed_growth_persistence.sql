-- ========================================================================
-- Migration: 20261123193000_embed_growth_persistence.sql
-- TalentXcel Global Embed Adoption Engine — Outreach Persistence & Whitelist
-- ========================================================================

-- 1. Whitelisted Publisher Domains (Prevents open attribution spoofing)
CREATE TABLE IF NOT EXISTS public.embed_domain_whitelist (
  domain TEXT PRIMARY KEY,
  publisher_name TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_domain_whitelist_verified ON public.embed_domain_whitelist(is_verified);

ALTER TABLE public.embed_domain_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read domain whitelist"
  ON public.embed_domain_whitelist
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin write domain whitelist"
  ON public.embed_domain_whitelist
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');

-- 2. Outreach Action Ledger (Persists all manual outreach actions, preventing React-only state loss)
CREATE TABLE IF NOT EXISTS public.publisher_outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id TEXT NOT NULL REFERENCES public.embed_publisher_opportunities(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'draft_created', 'draft_reviewed', 'outreach_approved', 'outreach_sent',
    'reply_recorded', 'followup_scheduled', 'publisher_declined',
    'publisher_interested', 'adoption_claimed', 'marked_contacted',
    'adoption_verified'
  )),
  operator_id TEXT NOT NULL DEFAULT 'system_admin',
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'contact_form', 'social', 'phone', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publisher_outreach_log_pub_id ON public.publisher_outreach_log(publisher_id);
CREATE INDEX IF NOT EXISTS idx_publisher_outreach_log_action ON public.publisher_outreach_log(action);
CREATE INDEX IF NOT EXISTS idx_publisher_outreach_log_time ON public.publisher_outreach_log(created_at DESC);

ALTER TABLE public.publisher_outreach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access publisher outreach log"
  ON public.publisher_outreach_log
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');

-- 3. Verified Embed Adoptions (Real-world verified installations)
CREATE TABLE IF NOT EXISTS public.embed_adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id TEXT REFERENCES public.embed_publisher_opportunities(id) ON DELETE SET NULL,
  domain TEXT NOT NULL UNIQUE,
  asset_id TEXT NOT NULL,
  target_page_url TEXT,
  verification_level INTEGER NOT NULL DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 5),
  dom_verified BOOLEAN NOT NULL DEFAULT false,
  has_telemetry BOOLEAN NOT NULL DEFAULT false,
  verified_by TEXT,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_adoptions_domain ON public.embed_adoptions(domain);
CREATE INDEX IF NOT EXISTS idx_embed_adoptions_level ON public.embed_adoptions(verification_level);

ALTER TABLE public.embed_adoptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read verified adoptions"
  ON public.embed_adoptions
  FOR SELECT
  TO public
  USING (verification_level >= 4);

CREATE POLICY "Admin full access embed adoptions"
  ON public.embed_adoptions
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');

-- 4. Inbound Referral Clicks Ledger
CREATE TABLE IF NOT EXISTS public.embed_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_domain TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  referrer_url TEXT,
  landing_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_referrals_domain ON public.embed_referrals(publisher_domain);
CREATE INDEX IF NOT EXISTS idx_embed_referrals_time ON public.embed_referrals(created_at DESC);

ALTER TABLE public.embed_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert embed referrals"
  ON public.embed_referrals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin read embed referrals"
  ON public.embed_referrals
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');
