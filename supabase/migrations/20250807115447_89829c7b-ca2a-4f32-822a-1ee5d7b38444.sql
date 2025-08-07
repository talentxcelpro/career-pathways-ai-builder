-- Create comprehensive talent database schema

-- Enhanced profiles table for talent database
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'open_to_opportunities';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_salary_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_salary_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_meta_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_meta_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Original CV files storage
CREATE TABLE IF NOT EXISTS public.cv_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    parsing_status TEXT DEFAULT 'pending',
    parsed_at TIMESTAMP WITH TIME ZONE,
    parsing_results JSONB DEFAULT '{}'::jsonb,
    is_primary BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    employment_type TEXT DEFAULT 'full_time',
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    location TEXT,
    description TEXT,
    skills_used JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_year INTEGER,
    end_year INTEGER,
    grade_or_gpa TEXT,
    description TEXT,
    is_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job preferences for candidates
CREATE TABLE IF NOT EXISTS public.job_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_job_titles JSONB DEFAULT '[]'::jsonb,
    preferred_locations JSONB DEFAULT '[]'::jsonb,
    preferred_industries JSONB DEFAULT '[]'::jsonb,
    preferred_company_sizes JSONB DEFAULT '[]'::jsonb,
    employment_types JSONB DEFAULT '["full_time"]'::jsonb,
    remote_work_preference TEXT DEFAULT 'hybrid',
    minimum_salary INTEGER,
    maximum_salary INTEGER,
    salary_currency TEXT DEFAULT 'INR',
    notice_period TEXT DEFAULT '30_days',
    relocation_willingness BOOLEAN DEFAULT false,
    visa_sponsorship_needed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Job matches
CREATE TABLE IF NOT EXISTS public.ai_job_matches_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2) NOT NULL,
    matching_criteria JSONB DEFAULT '{}'::jsonb,
    skill_gaps JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    recommendation_reason TEXT,
    is_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    candidate_response TEXT, -- interested, not_interested, applied
    employer_viewed BOOLEAN DEFAULT false,
    employer_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile views tracking for analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    viewer_type TEXT DEFAULT 'anonymous', -- anonymous, candidate, employer, admin
    view_source TEXT, -- search, direct_link, job_match, etc.
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    session_duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk upload batches for tracking
CREATE TABLE IF NOT EXISTS public.bulk_upload_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID REFERENCES public.profiles(id),
    batch_name TEXT NOT NULL,
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    successful_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    processing_status TEXT DEFAULT 'pending',
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Talent database access for employers
CREATE TABLE IF NOT EXISTS public.employer_talent_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    access_type TEXT DEFAULT 'free', -- free, premium, enterprise
    cv_download_limit INTEGER DEFAULT 5,
    cv_downloads_used INTEGER DEFAULT 0,
    profile_views_limit INTEGER DEFAULT 50,
    profile_views_used INTEGER DEFAULT 0,
    subscription_start_date DATE,
    subscription_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_job_matches_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_talent_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- CV Files policies
CREATE POLICY "Users can view their own CV files" ON public.cv_files
    FOR SELECT USING (user_id = auth.uid() OR uploaded_by = auth.uid());

CREATE POLICY "Admins can view all CV files" ON public.cv_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
        )
    );

CREATE POLICY "Premium employers can view CV files" ON public.cv_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.employer_talent_access eta
            WHERE eta.employer_id = auth.uid() 
            AND eta.access_type IN ('premium', 'enterprise')
            AND eta.is_active = true
            AND eta.cv_downloads_used < eta.cv_download_limit
        )
    );

-- Work experience policies
CREATE POLICY "Users can manage their work experience" ON public.work_experience
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view work experience for public profiles" ON public.work_experience
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = work_experience.user_id AND public_profile = true
        )
    );

-- Education policies  
CREATE POLICY "Users can manage their education" ON public.education
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view education for public profiles" ON public.education
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = education.user_id AND public_profile = true
        )
    );

-- Job preferences policies
CREATE POLICY "Users can manage their job preferences" ON public.job_preferences
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Employers can view job preferences for matching" ON public.job_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.employer_talent_access eta
            WHERE eta.employer_id = auth.uid() AND eta.is_active = true
        )
    );

-- AI job matches policies
CREATE POLICY "Users can view their job matches" ON public.ai_job_matches_enhanced
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their match responses" ON public.ai_job_matches_enhanced
    FOR UPDATE USING (user_id = auth.uid());

-- Profile views policies
CREATE POLICY "Anyone can insert profile views" ON public.profile_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their profile analytics" ON public.profile_views
    FOR SELECT USING (profile_id = auth.uid());

-- Bulk upload batches policies
CREATE POLICY "Admins can manage bulk uploads" ON public.bulk_upload_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
        )
    );

-- Employer talent access policies
CREATE POLICY "Employers can view their access info" ON public.employer_talent_access
    FOR SELECT USING (employer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_files_user_id ON public.cv_files(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_files_parsing_status ON public.cv_files(parsing_status);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON public.work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_job_preferences_user_id ON public.job_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_job_matches_user_id ON public.ai_job_matches_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_job_matches_job_id ON public.ai_job_matches_enhanced(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_job_matches_score ON public.ai_job_matches_enhanced(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON public.profile_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_public_profile ON public.profiles(public_profile) WHERE public_profile = true;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cv_files_updated_at BEFORE UPDATE ON public.cv_files
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON public.work_experience
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON public.job_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_job_matches_enhanced_updated_at BEFORE UPDATE ON public.ai_job_matches_enhanced
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_upload_batches_updated_at BEFORE UPDATE ON public.bulk_upload_batches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employer_talent_access_updated_at BEFORE UPDATE ON public.employer_talent_access
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();