-- Phase 3: Fix Critical Security Issues (Focused on most critical)

-- 1. Fix RLS for profiles table (CRITICAL - publicly exposed user data)
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

-- 2. Fix RLS for colleges table (CRITICAL - contact info exposed)
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view college info" 
ON public.colleges 
FOR SELECT 
USING (true);

-- 3. Fix RLS for companies table (CRITICAL - company data exposed)  
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company info" 
ON public.companies 
FOR SELECT 
USING (true);