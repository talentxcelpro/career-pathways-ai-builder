-- Check if unified_candidates table exists and create it if not
DO $$
BEGIN
    -- Check if unified_candidates table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'unified_candidates') THEN
        -- Create unified_candidates table
        CREATE TABLE public.unified_candidates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            name TEXT,
            email TEXT,
            phone TEXT,
            location TEXT,
            title TEXT,
            company TEXT,
            description TEXT,
            skills TEXT[],
            experience_years INTEGER DEFAULT 0,
            profile_picture_url TEXT,
            resume_url TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            portfolio_url TEXT,
            industry TEXT,
            looking_for_job BOOLEAN DEFAULT true,
            source TEXT NOT NULL CHECK (source IN ('application', 'platform')),
            application_data JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.unified_candidates ENABLE ROW LEVEL SECURITY;

        -- Create indexes
        CREATE INDEX idx_unified_candidates_source ON public.unified_candidates(source);
        CREATE INDEX idx_unified_candidates_email ON public.unified_candidates(email);
        CREATE INDEX idx_unified_candidates_skills ON public.unified_candidates USING GIN(skills);
        CREATE INDEX idx_unified_candidates_created_at ON public.unified_candidates(created_at);

        -- RLS Policies
        CREATE POLICY "Employers can view all candidates" ON public.unified_candidates
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() 
                    AND role IN ('employer', 'admin', 'super_admin') 
                    AND is_active = true
                )
            );

        CREATE POLICY "System can manage unified candidates" ON public.unified_candidates
            FOR ALL USING (true);

        -- Create trigger for updated_at
        CREATE OR REPLACE FUNCTION public.update_unified_candidates_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_unified_candidates_updated_at
            BEFORE UPDATE ON public.unified_candidates
            FOR EACH ROW
            EXECUTE FUNCTION public.update_unified_candidates_updated_at();

        -- Populate unified_candidates with existing data
        -- From enhanced_job_applications
        INSERT INTO public.unified_candidates (
            user_id, name, email, phone, location, title, company, 
            description, skills, experience_years, profile_picture_url,
            resume_url, source, application_data, created_at
        )
        SELECT DISTINCT
            eja.user_id,
            p.full_name,
            p.email,
            p.phone,
            eja.preferred_location,
            eja.current_role,
            p.current_company,
            p.about,
            p.skills,
            p.experience_years,
            p.profile_picture_url,
            eja.resume_url,
            'application',
            eja.application_data,
            eja.created_at
        FROM public.enhanced_job_applications eja
        LEFT JOIN public.profiles p ON eja.user_id = p.id
        WHERE eja.user_id IS NOT NULL
        ON CONFLICT (email) DO NOTHING;

        -- From profiles (platform users)
        INSERT INTO public.unified_candidates (
            user_id, name, email, phone, location, title, company,
            description, skills, experience_years, profile_picture_url,
            resume_url, linkedin_url, github_url, portfolio_url,
            looking_for_job, source, created_at
        )
        SELECT DISTINCT
            p.id,
            p.full_name,
            p.email,
            p.phone,
            p.location,
            p.title,
            p.current_company,
            p.about,
            p.skills,
            p.experience_years,
            p.profile_picture_url,
            p.resume_url,
            p.linkedin_url,
            p.github_url,
            p.portfolio_url,
            p.looking_for_job,
            'platform',
            p.created_at
        FROM public.profiles p
        WHERE p.email IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.unified_candidates uc 
            WHERE uc.email = p.email
        );

    END IF;
END $$;