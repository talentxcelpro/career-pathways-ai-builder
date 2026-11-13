-- supabase/migrations/20261113000000_payscale_salary_intelligence_suite.sql
-- TalentXcel PayScale: Salary Intelligence, Tax Planning & Enterprise Compensation Platform Schema
-- Strictly isolated RLS, audit logs, employee/employer tenant separation.

-- 1. PayScale Profiles (Individual User Salary Preference & Benchmarking)
CREATE TABLE IF NOT EXISTS public.payscale_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_role TEXT NOT NULL,
  current_ctc_lakhs NUMERIC(10,2) NOT NULL,
  experience_years NUMERIC(4,1) NOT NULL DEFAULT 0,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  industry TEXT NOT NULL DEFAULT 'Technology, Cloud & AI',
  target_role TEXT,
  target_ctc_lakhs NUMERIC(10,2),
  preferred_regime TEXT DEFAULT 'new' CHECK (preferred_regime IN ('new', 'old')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.payscale_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payscale profile"
  ON public.payscale_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Salary Calculations (Saved calculations for individuals)
CREATE TABLE IF NOT EXISTS public.salary_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'My Salary Calculation',
  annual_ctc NUMERIC(12,2) NOT NULL,
  monthly_in_hand NUMERIC(12,2) NOT NULL,
  financial_year TEXT NOT NULL DEFAULT '2026-27',
  regime TEXT NOT NULL DEFAULT 'new' CHECK (regime IN ('new', 'old')),
  calculation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.salary_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own salary calculations"
  ON public.salary_calculations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Payslips (Generated Formal Payslips)
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_id TEXT,
  designation TEXT NOT NULL,
  month_year TEXT NOT NULL,
  gross_earnings NUMERIC(12,2) NOT NULL,
  total_deductions NUMERIC(12,2) NOT NULL,
  net_salary NUMERIC(12,2) NOT NULL,
  payslip_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own payslips"
  ON public.payslips FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Salary Offers & Negotiation Sessions
CREATE TABLE IF NOT EXISTS public.salary_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  offered_ctc_lakhs NUMERIC(10,2) NOT NULL,
  current_ctc_lakhs NUMERIC(10,2) NOT NULL,
  fixed_percentage NUMERIC(5,2) DEFAULT 80.0,
  variable_percentage NUMERIC(5,2) DEFAULT 20.0,
  esops_value_lakhs NUMERIC(10,2) DEFAULT 0,
  joining_bonus_lakhs NUMERIC(10,2) DEFAULT 0,
  target_counter_ctc_lakhs NUMERIC(10,2),
  offer_evaluation JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'evaluating' CHECK (status IN ('evaluating', 'counter_sent', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.salary_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own offers"
  ON public.salary_offers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Employer Workspaces & Pay Bands (B2B Compensation)
CREATE TABLE IF NOT EXISTS public.employer_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL DEFAULT 'Technology',
  headcount_range TEXT DEFAULT '50-250',
  compensation_currency TEXT DEFAULT 'INR',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employer_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can manage their employer workspace"
  ON public.employer_workspaces FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 6. Employer Employee Compensation Records
CREATE TABLE IF NOT EXISTS public.employee_compensation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.employer_workspaces(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  department TEXT NOT NULL,
  job_level TEXT NOT NULL, -- e.g. L1, L2, L3, L4, L5, L6, L7
  designation TEXT NOT NULL,
  current_annual_ctc NUMERIC(12,2) NOT NULL,
  last_appraisal_rating NUMERIC(2,1), -- 1.0 to 5.0
  proposed_increment_pct NUMERIC(5,2) DEFAULT 0,
  market_compa_ratio NUMERIC(5,2), -- e.g. 0.95 or 1.15
  flight_risk_level TEXT DEFAULT 'Low' CHECK (flight_risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can access employee compensation"
  ON public.employee_compensation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_workspaces w
      WHERE w.id = employee_compensation.workspace_id
      AND w.owner_user_id = auth.uid()
    )
  );

-- 7. Calculation Audit Logs
CREATE TABLE IF NOT EXISTS public.calculation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  financial_year TEXT NOT NULL DEFAULT '2026-27',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calculation_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create audit logs"
  ON public.calculation_audit_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payscale_profiles_user ON public.payscale_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_user ON public.salary_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_user ON public.payslips(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_offers_user ON public.salary_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_compensation_workspace ON public.employee_compensation(workspace_id);
