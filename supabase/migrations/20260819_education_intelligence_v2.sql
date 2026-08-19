-- ==============================================================================
-- TalentXcel — Global Education Intelligence Layer Schema V2
-- Multi-Evidence Ledger, Authoritative Source Registry & Ingestion Pipeline
-- ==============================================================================

-- 1. AUTHORITATIVE SOURCE REGISTRY
CREATE TABLE IF NOT EXISTS public.education_source_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('national_portal', 'ministry', 'university_domain', 'scholarship_body', 'accreditation_body', 'aggregator')),
    base_url TEXT NOT NULL,
    official_domain TEXT NOT NULL UNIQUE,
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    crawl_frequency_hours INTEGER NOT NULL DEFAULT 24,
    last_crawled_at TIMESTAMPTZ,
    next_crawl_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INSTITUTIONS
CREATE TABLE IF NOT EXISTS public.education_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT,
    type TEXT NOT NULL CHECK (type IN ('public', 'private', 'online', 'government')),
    ranking_qs INTEGER,
    ranking_the INTEGER,
    official_website_url TEXT NOT NULL,
    logo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EDUCATION PROGRAMS
CREATE TABLE IF NOT EXISTS public.education_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.education_institutions(id) ON DELETE SET NULL,
    institution_name TEXT NOT NULL,
    institution_country TEXT NOT NULL,
    institution_type TEXT NOT NULL DEFAULT 'public',
    program_title TEXT NOT NULL,
    field TEXT NOT NULL,
    discipline TEXT,
    level TEXT NOT NULL CHECK (level IN ('school', 'diploma', 'bachelor', 'master', 'phd', 'postdoc', 'certificate', 'short_course')),
    credential TEXT NOT NULL,
    credential_type TEXT NOT NULL DEFAULT 'degree' CHECK (credential_type IN ('degree', 'diploma', 'professional_certificate', 'course_certificate', 'none')),
    academic_credits_awarded BOOLEAN NOT NULL DEFAULT true,
    duration_months INTEGER NOT NULL DEFAULT 24,
    language TEXT NOT NULL DEFAULT 'English',
    mode TEXT NOT NULL DEFAULT 'on_campus' CHECK (mode IN ('on_campus', 'online', 'hybrid')),
    
    access_type TEXT NOT NULL CHECK (access_type IN ('FULLY_FUNDED', 'TUITION_FREE', 'SCHOLARSHIP_MAKES_IT_FREE', 'FREE_TO_LEARN_PAID_CREDENTIAL')),
    tuition_cost_usd NUMERIC NOT NULL DEFAULT 0,
    other_mandatory_costs_usd NUMERIC NOT NULL DEFAULT 0,
    currency_note TEXT,
    
    scholarship_available BOOLEAN NOT NULL DEFAULT false,
    scholarship_name TEXT,
    scholarship_coverage TEXT CHECK (scholarship_coverage IN ('FULL', 'TUITION', 'PARTIAL', 'LIVING', 'TRAVEL')),
    scholarship_amount_usd NUMERIC,
    scholarship_url TEXT,
    potential_zero_cost BOOLEAN NOT NULL DEFAULT false,
    
    eligible_nationalities TEXT[] DEFAULT '{}',
    min_gpa NUMERIC,
    required_exams TEXT[] DEFAULT '{}',
    min_language_score TEXT,
    
    application_deadline DATE,
    intake_months TEXT[] DEFAULT '{}',
    application_fee_usd NUMERIC DEFAULT 0,
    
    official_url TEXT NOT NULL,
    source_evidence TEXT,
    tuition_evidence TEXT,
    funding_evidence TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('VERIFIED', 'PENDING', 'NEEDS_REVIEW', 'UNVERIFIED', 'FLAGGED')),
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
    is_published BOOLEAN NOT NULL DEFAULT false,
    last_verified_at TIMESTAMPTZ,
    next_verification_due TIMESTAMPTZ,
    verified_by TEXT,
    
    career_relevance TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    industry_id TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MULTI-EVIDENCE LEDGER
CREATE TABLE IF NOT EXISTS public.education_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('program', 'scholarship', 'institution', 'course')),
    entity_id UUID NOT NULL,
    source_url TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('national_portal', 'ministry', 'university_domain', 'scholarship_body', 'accreditation_body', 'aggregator')),
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('tuition', 'funding', 'eligibility', 'deadline', 'accreditation', 'credential')),
    evidence_text TEXT NOT NULL,
    content_hash TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'NEEDS_REVIEW', 'FLAGGED')),
    confidence_score INTEGER NOT NULL DEFAULT 85 CHECK (confidence_score BETWEEN 0 AND 100)
);

-- 5. LEARNING COURSES (Non-degree foundation units)
CREATE TABLE IF NOT EXISTS public.education_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    platform TEXT,
    field TEXT NOT NULL,
    course_access_type TEXT NOT NULL CHECK (course_access_type IN ('FREE_TO_LEARN', 'FREE_WITH_LIMITATIONS', 'PAID_CREDENTIAL', 'PAID')),
    academic_credits_awarded BOOLEAN NOT NULL DEFAULT false,
    credential_type TEXT NOT NULL DEFAULT 'course_certificate',
    estimated_hours INTEGER,
    url TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    evidence_text TEXT,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SCHOLARSHIPS
CREATE TABLE IF NOT EXISTS public.education_scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_country TEXT NOT NULL,
    provider_logo_url TEXT,
    description TEXT,
    amount_usd NUMERIC,
    coverage TEXT NOT NULL CHECK (coverage IN ('FULL', 'TUITION', 'PARTIAL', 'LIVING', 'TRAVEL')),
    coverage_detail TEXT,
    eligible_levels TEXT[] DEFAULT '{}',
    eligible_nationalities TEXT[] DEFAULT '{}',
    eligible_fields TEXT[] DEFAULT '{}',
    eligible_countries TEXT[] DEFAULT '{}',
    deadline DATE,
    renewable BOOLEAN NOT NULL DEFAULT false,
    duration_months INTEGER,
    can_make_tuition_zero BOOLEAN NOT NULL DEFAULT false,
    official_url TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    confidence_score INTEGER DEFAULT 95,
    last_verified_at TIMESTAMPTZ,
    source_evidence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_edu_prog_field ON public.education_programs(field);
CREATE INDEX IF NOT EXISTS idx_edu_prog_access ON public.education_programs(access_type);
CREATE INDEX IF NOT EXISTS idx_edu_prog_country ON public.education_programs(institution_country);
CREATE INDEX IF NOT EXISTS idx_edu_prog_published ON public.education_programs(is_published);
CREATE INDEX IF NOT EXISTS idx_edu_evidence_entity ON public.education_evidence(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_edu_sources_domain ON public.education_source_registry(official_domain);

-- RLS POLICIES
ALTER TABLE public.education_source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read verified programs" ON public.education_programs FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public read verified courses" ON public.education_courses FOR SELECT USING (true);
CREATE POLICY "Public read verified scholarships" ON public.education_scholarships FOR SELECT USING (true);
CREATE POLICY "Public read evidence" ON public.education_evidence FOR SELECT USING (true);
CREATE POLICY "Public read source registry" ON public.education_source_registry FOR SELECT USING (true);
CREATE POLICY "Public read institutions" ON public.education_institutions FOR SELECT USING (true);
