-- ─────────────────────────────────────────────────────────────────────────────
-- TalentXcel Global Education Intelligence Layer
-- Migration: 20260819_global_education_layer.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. GLOBAL PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.global_programs (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Institution
  institution_name            text NOT NULL,
  institution_country         text NOT NULL,
  institution_type            text NOT NULL DEFAULT 'public',
  institution_logo_url        text,
  institution_ranking_qs      int,
  institution_ranking_the     int,

  -- Program
  program_title               text NOT NULL,
  field                       text NOT NULL,
  discipline                  text,
  level                       text NOT NULL,
  credential                  text NOT NULL,
  duration_months             int NOT NULL,
  language                    text NOT NULL DEFAULT 'English',
  mode                        text NOT NULL DEFAULT 'on_campus',

  -- Cost (all required before going live)
  access_type                 text NOT NULL,
  tuition_cost_usd            numeric NOT NULL DEFAULT 0,
  other_mandatory_costs_usd   numeric NOT NULL DEFAULT 0,
  currency_note               text,

  -- Funding
  scholarship_available       boolean NOT NULL DEFAULT false,
  scholarship_name            text,
  scholarship_coverage        text,
  scholarship_amount_usd      numeric,
  scholarship_url             text,
  potential_zero_cost         boolean NOT NULL DEFAULT false,

  -- Eligibility
  eligible_nationalities      text[],
  min_gpa                     numeric,
  required_exams              text[],
  min_language_score          text,

  -- Application
  application_deadline        date,
  intake_months               text[],
  application_fee_usd         numeric DEFAULT 0,

  -- Verification (agent-updatable)
  official_url                text NOT NULL,
  source_evidence             text,
  verification_status         text NOT NULL DEFAULT 'PENDING',
  last_verified_at            timestamptz,
  next_verification_due       timestamptz,
  verified_by                 text,

  -- Career graph links
  career_relevance            text[],
  skills                      text[],
  industry_id                 text,

  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gp_country ON public.global_programs(institution_country);
CREATE INDEX IF NOT EXISTS idx_gp_level ON public.global_programs(level);
CREATE INDEX IF NOT EXISTS idx_gp_access_type ON public.global_programs(access_type);
CREATE INDEX IF NOT EXISTS idx_gp_field ON public.global_programs(field);
CREATE INDEX IF NOT EXISTS idx_gp_verification ON public.global_programs(verification_status);
CREATE INDEX IF NOT EXISTS idx_gp_zero_cost ON public.global_programs(potential_zero_cost);

-- 2. GLOBAL SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.global_scholarships (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  title                       text NOT NULL,
  provider                    text NOT NULL,
  provider_country            text NOT NULL,
  provider_logo_url           text,

  description                 text,
  amount_usd                  numeric,
  coverage                    text NOT NULL DEFAULT 'PARTIAL',
  coverage_detail             text,

  eligible_levels             text[],
  eligible_nationalities      text[],
  eligible_fields             text[],
  eligible_countries          text[],

  deadline                    date,
  renewable                   boolean NOT NULL DEFAULT false,
  duration_months             int,

  can_make_tuition_zero       boolean NOT NULL DEFAULT false,

  official_url                text NOT NULL,
  verification_status         text NOT NULL DEFAULT 'PENDING',
  last_verified_at            timestamptz,
  source_evidence             text,

  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gs_country ON public.global_scholarships(provider_country);
CREATE INDEX IF NOT EXISTS idx_gs_zero ON public.global_scholarships(can_make_tuition_zero);
CREATE INDEX IF NOT EXISTS idx_gs_coverage ON public.global_scholarships(coverage);

-- 3. EDUCATION PATHWAYS TABLE (cached AI-generated pathways)
CREATE TABLE IF NOT EXISTS public.education_pathways (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  goal                        text NOT NULL,
  current_level               text NOT NULL,
  budget                      text NOT NULL,
  nationality                 text,

  goal_resolved               text,
  skills_required             text[],
  pathway_json                jsonb NOT NULL,

  total_estimated_cost        text,
  honest_caveat               text,

  generated_at                timestamptz NOT NULL DEFAULT now(),
  expires_at                  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ep_user ON public.education_pathways(user_id);
CREATE INDEX IF NOT EXISTS idx_ep_goal ON public.education_pathways USING gin(to_tsvector('english', goal));

-- RLS: Global programs are public read
ALTER TABLE public.global_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "global_programs_public_read" ON public.global_programs;
CREATE POLICY "global_programs_public_read" ON public.global_programs
  FOR SELECT USING (true);

ALTER TABLE public.global_scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "global_scholarships_public_read" ON public.global_scholarships;
CREATE POLICY "global_scholarships_public_read" ON public.global_scholarships
  FOR SELECT USING (true);

ALTER TABLE public.education_pathways ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pathways_own" ON public.education_pathways;
CREATE POLICY "pathways_own" ON public.education_pathways
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
