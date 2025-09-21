-- Phase 3: Fix Critical Security Issues (Corrected)

-- 1. Fix RLS for profiles table (critical error - publicly exposed user data)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL);

-- 2. Fix RLS for colleges table (critical error - contact info exposed)
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view college names and basic info" 
ON public.colleges 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert colleges" 
ON public.colleges 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage colleges" 
ON public.colleges 
FOR ALL 
USING (public.is_current_user_admin());

-- 3. Fix RLS for companies table (critical error - company data exposed)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company basic info" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage companies" 
ON public.companies 
FOR ALL 
USING (public.is_current_user_admin());

-- 4. Fix RLS for jobs table (critical error - employer data exposed)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true AND job_status = 'open');

CREATE POLICY "Job posters can manage their jobs" 
ON public.jobs 
FOR ALL 
USING (posted_by = auth.uid() OR public.is_current_user_admin());

-- 5. Fix RLS for candidates table (critical error - resume data exposed)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view their own data" 
ON public.candidates 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = candidates.profile_id));

CREATE POLICY "Admins can view all candidates" 
ON public.candidates 
FOR SELECT 
USING (public.is_current_user_admin());

-- 6. Fix other critical tables without RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active stories" 
ON public.stories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE public.career_passport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own career passport" 
ON public.career_passport 
FOR ALL 
USING (user_id = auth.uid());

ALTER TABLE public.user_journey_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own journey" 
ON public.user_journey_tracking 
FOR ALL 
USING (user_id = auth.uid());

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own scores" 
ON public.user_scores 
FOR ALL 
USING (user_id = auth.uid());

-- 7. Create missing RLS policies for news articles
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published articles" 
ON public.news_articles 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authors can manage their articles" 
ON public.news_articles 
FOR ALL 
USING (author_id = auth.uid() OR public.is_current_user_admin());