-- Create colleges table with comprehensive college information
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_name TEXT NOT NULL,
  college_code TEXT UNIQUE,
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- College type and location
  college_type TEXT NOT NULL CHECK (college_type IN ('government', 'private', 'autonomous', 'central', 'deemed')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Basic info
  description TEXT,
  vision TEXT,
  mission TEXT,
  history TEXT,
  established_year INTEGER,
  
  -- Student and faculty data
  student_count INTEGER DEFAULT 0,
  faculty_count INTEGER DEFAULT 0,
  
  -- Verification and status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  
  -- Accreditation and rankings
  accreditations JSONB DEFAULT '[]'::jsonb,
  rankings JSONB DEFAULT '[]'::jsonb,
  awards JSONB DEFAULT '[]'::jsonb,
  
  -- Media and social
  logo_url TEXT,
  banner_image_url TEXT,
  campus_images JSONB DEFAULT '[]'::jsonb,
  campus_videos JSONB DEFAULT '[]'::jsonb,
  virtual_tour_url TEXT,
  social_media_links JSONB DEFAULT '{}'::jsonb,
  
  -- Premium features
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Programs and courses
  programs_offered JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- Create college_programs table to link colleges with specific programs
CREATE TABLE public.college_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL, -- 'undergraduate', 'postgraduate', 'diploma', 'certificate'
  department TEXT,
  duration_years DECIMAL(3,1),
  fees_annual DECIMAL(12,2),
  seats_total INTEGER,
  seats_available INTEGER,
  eligibility_criteria TEXT,
  program_description TEXT,
  
  -- Placement and outcomes
  placement_percentage DECIMAL(5,2),
  average_package DECIMAL(12,2),
  highest_package DECIMAL(12,2),
  top_recruiters JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create college_alumni table for tracking alumni data
CREATE TABLE public.college_alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID, -- Link to platform users if they join
  
  -- Alumni details
  full_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  program_name TEXT,
  department TEXT,
  current_designation TEXT,
  current_company TEXT,
  current_package DECIMAL(12,2),
  location TEXT,
  
  -- Contact (optional)
  email TEXT,
  linkedin_url TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create college_inquiries for student inquiries
CREATE TABLE public.college_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID, -- Student making inquiry
  
  -- Inquiry details
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('admission', 'program', 'fees', 'placement', 'general')),
  program_interest TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Contact info
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create college_events for college-hosted events
CREATE TABLE public.college_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('open_house', 'webinar', 'career_fair', 'workshop', 'seminar', 'cultural', 'sports')),
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  
  -- Registration
  registration_required BOOLEAN DEFAULT true,
  registration_link TEXT,
  max_participants INTEGER,
  current_registrations INTEGER DEFAULT 0,
  
  -- Media
  banner_image_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create college_analytics for tracking metrics
CREATE TABLE public.college_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  -- Metrics
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  
  -- Metadata
  additional_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for colleges
CREATE POLICY "Everyone can view verified colleges" 
ON public.colleges FOR SELECT 
USING (verification_status = 'verified' AND is_active = true);

CREATE POLICY "Admins can manage all colleges" 
ON public.colleges FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for college_programs
CREATE POLICY "Everyone can view active programs" 
ON public.college_programs FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage college programs" 
ON public.college_programs FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for college_alumni
CREATE POLICY "Everyone can view verified alumni" 
ON public.college_alumni FOR SELECT 
USING (is_verified = true);

CREATE POLICY "Admins can manage alumni data" 
ON public.college_alumni FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can manage their own alumni profile" 
ON public.college_alumni FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for college_inquiries
CREATE POLICY "Users can view their own inquiries" 
ON public.college_inquiries FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create inquiries" 
ON public.college_inquiries FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all inquiries" 
ON public.college_inquiries FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for college_events
CREATE POLICY "Everyone can view active events" 
ON public.college_events FOR SELECT 
USING (is_active = true AND event_date >= now());

CREATE POLICY "Admins can manage college events" 
ON public.college_events FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for college_analytics
CREATE POLICY "Admins can manage college analytics" 
ON public.college_analytics FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_colleges_verification_status ON public.colleges(verification_status);
CREATE INDEX idx_colleges_college_type ON public.colleges(college_type);
CREATE INDEX idx_colleges_state_city ON public.colleges(state, city);
CREATE INDEX idx_colleges_premium ON public.colleges(is_premium);
CREATE INDEX idx_college_programs_college_id ON public.college_programs(college_id);
CREATE INDEX idx_college_alumni_college_id ON public.college_alumni(college_id);
CREATE INDEX idx_college_inquiries_college_id ON public.college_inquiries(college_id);
CREATE INDEX idx_college_events_college_id ON public.college_events(college_id);
CREATE INDEX idx_college_analytics_college_id ON public.college_analytics(college_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_colleges_updated_at 
    BEFORE UPDATE ON public.colleges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_college_programs_updated_at 
    BEFORE UPDATE ON public.college_programs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_college_alumni_updated_at 
    BEFORE UPDATE ON public.college_alumni 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();