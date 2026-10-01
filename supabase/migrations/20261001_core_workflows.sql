-- Phase 1: Core Data Foundation for TalentXcel SI Ecosystem
-- Run this in the Supabase SQL Editor to create missing tables and RLS policies.

-----------------------------------------
-- 1. CAREER PASSPORTS
-----------------------------------------
CREATE TABLE IF NOT EXISTS public.career_passports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- SI Understanding Context
    career_goals TEXT,
    industry_preferences TEXT[],
    target_roles TEXT[],
    target_salary_range TEXT,
    preferred_locations TEXT[],
    remote_preference TEXT,
    
    -- Extracted SI Metrics
    talent_score INTEGER DEFAULT 0,
    si_analysis_summary TEXT,
    si_skill_gaps JSONB DEFAULT '[]'::jsonb,
    si_career_trajectory JSONB DEFAULT '{}'::jsonb,
    
    -- Passport Data
    parsed_skills TEXT[],
    parsed_experience JSONB DEFAULT '[]'::jsonb,
    parsed_education JSONB DEFAULT '[]'::jsonb,
    parsed_certifications JSONB DEFAULT '[]'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    last_updated_by_si TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_career_passports_user ON public.career_passports(user_id);

ALTER TABLE public.career_passports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passport" 
ON public.career_passports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passport" 
ON public.career_passports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passport" 
ON public.career_passports FOR UPDATE USING (auth.uid() = user_id);


-----------------------------------------
-- 2. EMPLOYER REQUIREMENTS
-----------------------------------------
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed', 'draft')),
    
    -- Requirement specifics
    required_skills TEXT[] DEFAULT '{}'::text[],
    experience_level TEXT,
    budget_range TEXT,
    location_type TEXT,
    
    -- SI Context
    si_calibration_score INTEGER DEFAULT 0,
    si_generated_criteria JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requirements_employer ON public.requirements(employer_id);

ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own requirements" 
ON public.requirements FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Employers can insert own requirements" 
ON public.requirements FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own requirements" 
ON public.requirements FOR UPDATE USING (auth.uid() = employer_id);


-----------------------------------------
-- 3. CANDIDATE SHORTLISTS
-----------------------------------------
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE NOT NULL,
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contacted', 'interviewing', 'offered', 'hired', 'rejected')),
    
    -- SI Context
    si_match_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(requirement_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_employer ON public.shortlists(employer_id);

ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage own shortlists" 
ON public.shortlists FOR ALL USING (auth.uid() = employer_id);

CREATE POLICY "Candidates can view if contacted"
ON public.shortlists FOR SELECT USING (
  auth.uid() = candidate_id AND status NOT IN ('shortlisted', 'rejected')
);
