-- Add missing columns to colleges table
ALTER TABLE public.colleges 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Create college_programs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.college_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_type TEXT,
  duration TEXT,
  fees NUMERIC,
  seats_available INTEGER,
  description TEXT,
  eligibility TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create college_inquiries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.college_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  inquiry_type TEXT DEFAULT 'general',
  message TEXT,
  status TEXT DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create college_alumni table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.college_alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID,
  graduation_year INTEGER,
  program_name TEXT,
  current_position TEXT,
  current_company TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.college_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_alumni ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for college_programs
CREATE POLICY "Everyone can view college programs" 
ON public.college_programs FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage college programs" 
ON public.college_programs FOR ALL 
USING (is_current_user_admin());

-- Create RLS policies for college_inquiries
CREATE POLICY "College inquiries viewable by admin" 
ON public.college_inquiries FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Users can create inquiries" 
ON public.college_inquiries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage inquiries" 
ON public.college_inquiries FOR ALL 
USING (is_current_user_admin());

-- Create RLS policies for college_alumni
CREATE POLICY "Everyone can view verified alumni" 
ON public.college_alumni FOR SELECT 
USING (verified = true);

CREATE POLICY "Admins can manage alumni" 
ON public.college_alumni FOR ALL 
USING (is_current_user_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_college_programs_college_id ON public.college_programs(college_id);
CREATE INDEX IF NOT EXISTS idx_college_inquiries_college_id ON public.college_inquiries(college_id);
CREATE INDEX IF NOT EXISTS idx_college_alumni_college_id ON public.college_alumni(college_id);
CREATE INDEX IF NOT EXISTS idx_colleges_verification_status ON public.colleges(verification_status);
CREATE INDEX IF NOT EXISTS idx_colleges_is_premium ON public.colleges(is_premium);