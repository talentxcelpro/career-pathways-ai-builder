-- Create enhanced companies table with verification workflow
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Contact Information
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  
  -- Company Details
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  company_type TEXT CHECK (company_type IN ('private', 'public', 'government', 'ngo', 'startup')),
  founding_year INTEGER,
  revenue_range TEXT,
  
  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  banner_image_url TEXT,
  
  -- Status and Verification
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')),
  featured BOOLEAN DEFAULT false,
  
  -- Submission and Admin
  submitted_by UUID,
  verified_by UUID,
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Additional Info
  employees_count INTEGER,
  headquarters_location TEXT,
  social_media JSONB DEFAULT '{}',
  certifications TEXT[],
  awards TEXT[],
  
  -- SEO and Search
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  profile_completion_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create enhanced colleges table with comprehensive details
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Contact Information
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  
  -- College Details
  established_year INTEGER,
  college_type TEXT CHECK (college_type IN ('government', 'private', 'autonomous', 'deemed', 'central', 'state')),
  affiliation TEXT,
  recognition TEXT[],
  accreditation_grade TEXT,
  
  -- Rankings
  ranking_national INTEGER,
  ranking_nirf INTEGER,
  ranking_international INTEGER,
  
  -- Infrastructure
  campus_size_acres NUMERIC,
  total_faculty INTEGER,
  total_students INTEGER,
  hostels_available BOOLEAN DEFAULT false,
  library_books INTEGER,
  labs_count INTEGER,
  
  -- Financial
  average_fees_per_year INTEGER,
  scholarship_available BOOLEAN DEFAULT false,
  financial_aid_percentage NUMERIC,
  
  -- Placement
  placement_percentage NUMERIC,
  average_package INTEGER,
  highest_package INTEGER,
  top_recruiters TEXT[],
  
  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  virtual_tour_url TEXT,
  
  -- Status and Verification
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')),
  featured BOOLEAN DEFAULT false,
  
  -- Submission and Admin
  submitted_by UUID,
  verified_by UUID,
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Additional Details
  facilities TEXT[],
  courses_offered TEXT[],
  departments TEXT[],
  specializations TEXT[],
  entrance_exams TEXT[],
  
  -- Contact Person
  contact_person_name TEXT,
  contact_person_designation TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  
  -- SEO and Search
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- AI features
  ai_summary TEXT,
  ai_match_keywords TEXT[],
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  profile_completion_score INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create college courses table
CREATE TABLE IF NOT EXISTS public.college_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_code TEXT,
  degree_type TEXT NOT NULL CHECK (degree_type IN ('undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd')),
  discipline TEXT NOT NULL,
  specialization TEXT,
  duration_years INTEGER NOT NULL,
  
  description TEXT,
  syllabus_url TEXT,
  brochure_url TEXT,
  curriculum TEXT[],
  learning_outcomes TEXT[],
  career_prospects TEXT[],
  
  eligibility_criteria TEXT,
  entrance_exams TEXT[],
  total_seats INTEGER,
  
  total_fees INTEGER,
  fees_per_semester INTEGER,
  additional_fees JSONB DEFAULT '{}',
  scholarship_available BOOLEAN DEFAULT false,
  emi_available BOOLEAN DEFAULT false,
  
  placement_rate NUMERIC,
  average_salary INTEGER,
  top_recruiters TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  course_mode TEXT DEFAULT 'offline' CHECK (course_mode IN ('online', 'offline', 'hybrid')),
  
  ai_course_summary TEXT,
  ai_career_alignment_score NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company/college submission requests tables
CREATE TABLE IF NOT EXISTS public.company_submission_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_email TEXT,
  contact_person_name TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  website TEXT,
  description TEXT,
  employee_count TEXT,
  founding_year INTEGER,
  headquarters_location TEXT,
  logo_url TEXT,
  documents JSONB DEFAULT '{}',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  rejection_reason TEXT,
  
  submitted_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.college_submission_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_name TEXT NOT NULL,
  college_type TEXT,
  college_email TEXT,
  contact_person_name TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  website TEXT,
  description TEXT,
  established_year INTEGER,
  address TEXT,
  city TEXT,
  state TEXT,
  affiliation TEXT,
  accreditation TEXT,
  courses_offered TEXT[],
  facilities TEXT[],
  logo_url TEXT,
  documents JSONB DEFAULT '{}',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  rejection_reason TEXT,
  
  submitted_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews tables
CREATE TABLE IF NOT EXISTS public.company_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  work_culture_rating INTEGER CHECK (work_culture_rating >= 1 AND work_culture_rating <= 5),
  management_rating INTEGER CHECK (management_rating >= 1 AND management_rating <= 5),
  compensation_rating INTEGER CHECK (compensation_rating >= 1 AND compensation_rating <= 5),
  growth_opportunities_rating INTEGER CHECK (growth_opportunities_rating >= 1 AND growth_opportunities_rating <= 5),
  
  review_title TEXT,
  review_content TEXT NOT NULL,
  position TEXT,
  employment_type TEXT,
  experience_duration TEXT,
  
  pros TEXT,
  cons TEXT,
  advice_to_management TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  ai_sentiment_score NUMERIC,
  ai_sentiment_label TEXT CHECK (ai_sentiment_label IN ('positive', 'negative', 'neutral')),
  ai_extracted_topics TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.college_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  academic_rating INTEGER CHECK (academic_rating >= 1 AND academic_rating <= 5),
  infrastructure_rating INTEGER CHECK (infrastructure_rating >= 1 AND infrastructure_rating <= 5),
  faculty_rating INTEGER CHECK (faculty_rating >= 1 AND faculty_rating <= 5),
  placement_rating INTEGER CHECK (placement_rating >= 1 AND placement_rating <= 5),
  
  review_title TEXT,
  review_content TEXT NOT NULL,
  course_studied TEXT,
  graduation_year INTEGER,
  
  is_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  ai_sentiment_score NUMERIC,
  ai_sentiment_label TEXT CHECK (ai_sentiment_label IN ('positive', 'negative', 'neutral')),
  ai_extracted_topics TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks tables
CREATE TABLE IF NOT EXISTS public.company_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE TABLE IF NOT EXISTS public.college_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, college_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS companies_verification_status_idx ON public.companies(verification_status);
CREATE INDEX IF NOT EXISTS companies_industry_idx ON public.companies(industry);
CREATE INDEX IF NOT EXISTS companies_city_idx ON public.companies(city);
CREATE INDEX IF NOT EXISTS companies_name_search_idx ON public.companies USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS colleges_verification_status_idx ON public.colleges(verification_status);
CREATE INDEX IF NOT EXISTS colleges_college_type_idx ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS colleges_city_idx ON public.colleges(city);
CREATE INDEX IF NOT EXISTS colleges_name_search_idx ON public.colleges USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_courses_updated_at
  BEFORE UPDATE ON public.college_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create auto-slug generation functions
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_generate_college_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.colleges WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_company_slug_trigger
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_company_slug();

CREATE TRIGGER auto_generate_college_slug_trigger
  BEFORE INSERT OR UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_college_slug();

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_submission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_submission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Companies
CREATE POLICY "Anyone can view approved companies" ON public.companies
  FOR SELECT USING (verification_status = 'approved' AND is_active = true);

CREATE POLICY "Admins can manage all companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS Policies for Colleges
CREATE POLICY "Anyone can view approved colleges" ON public.colleges
  FOR SELECT USING (verification_status = 'approved' AND is_active = true);

CREATE POLICY "Admins can manage all colleges" ON public.colleges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS Policies for Course
CREATE POLICY "Anyone can view active courses" ON public.college_courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.college_courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS Policies for Submission Requests
CREATE POLICY "Users can create submission requests" ON public.company_submission_requests
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own requests" ON public.company_submission_requests
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all company requests" ON public.company_submission_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Users can create college requests" ON public.college_submission_requests
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own college requests" ON public.college_submission_requests
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all college requests" ON public.college_submission_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS Policies for Reviews
CREATE POLICY "Anyone can view reviews" ON public.company_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.company_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.company_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view college reviews" ON public.college_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create college reviews" ON public.college_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own college reviews" ON public.college_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Bookmarks
CREATE POLICY "Users can manage their company bookmarks" ON public.company_bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their college bookmarks" ON public.college_bookmarks
  FOR ALL USING (auth.uid() = user_id);