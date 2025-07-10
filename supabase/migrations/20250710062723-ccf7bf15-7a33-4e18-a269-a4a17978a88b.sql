
-- Create comprehensive college database schema for the enhanced colleges module

-- Main colleges table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  
  -- College details
  established_year INTEGER,
  college_type TEXT, -- 'government', 'private', 'autonomous', 'deemed'
  affiliation TEXT, -- University affiliation
  recognition TEXT[], -- AICTE, UGC, NAAC, etc.
  ranking_national INTEGER,
  ranking_nirf INTEGER,
  accreditation_grade TEXT, -- A++, A+, A, B++, etc.
  
  -- Infrastructure
  campus_size_acres DECIMAL,
  total_faculty INTEGER,
  total_students INTEGER,
  hostels_available BOOLEAN DEFAULT false,
  library_books INTEGER,
  labs_count INTEGER,
  
  -- Financial
  average_fees_per_year DECIMAL,
  scholarship_available BOOLEAN DEFAULT false,
  placement_percentage DECIMAL,
  average_package DECIMAL,
  highest_package DECIMAL,
  
  -- Status and verification
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  featured BOOLEAN DEFAULT false,
  
  -- SEO and content
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- AI features
  ai_summary TEXT,
  ai_match_keywords TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- College courses/programs table
CREATE TABLE public.college_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  course_name TEXT NOT NULL,
  course_code TEXT,
  degree_type TEXT NOT NULL, -- 'undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd'
  discipline TEXT NOT NULL, -- 'engineering', 'medicine', 'management', 'arts', 'science', etc.
  specialization TEXT,
  duration_years DECIMAL NOT NULL,
  
  -- Course details
  description TEXT,
  syllabus_url TEXT,
  brochure_url TEXT,
  curriculum TEXT[],
  learning_outcomes TEXT[],
  career_prospects TEXT[],
  
  -- Admission details
  eligibility_criteria TEXT,
  entrance_exams TEXT[], -- JEE, NEET, CAT, etc.
  total_seats INTEGER,
  reservation_details JSONB,
  
  -- Financial
  total_fees DECIMAL,
  fees_per_semester DECIMAL,
  additional_fees JSONB, -- hostel, mess, lab, library, etc.
  scholarship_available BOOLEAN DEFAULT false,
  emi_available BOOLEAN DEFAULT false,
  
  -- Placement
  placement_rate DECIMAL,
  average_salary DECIMAL,
  top_recruiters TEXT[],
  
  -- Course status
  is_active BOOLEAN DEFAULT true,
  course_mode TEXT DEFAULT 'offline', -- 'online', 'offline', 'hybrid'
  
  -- AI features
  ai_course_summary TEXT,
  ai_career_alignment_score DECIMAL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- College reviews table
CREATE TABLE public.college_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review details
  overall_rating DECIMAL NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  academic_rating DECIMAL CHECK (academic_rating >= 1 AND academic_rating <= 5),
  infrastructure_rating DECIMAL CHECK (infrastructure_rating >= 1 AND infrastructure_rating <= 5),
  faculty_rating DECIMAL CHECK (faculty_rating >= 1 AND faculty_rating <= 5),
  placement_rating DECIMAL CHECK (placement_rating >= 1 AND placement_rating <= 5),
  
  review_title TEXT,
  review_content TEXT NOT NULL,
  course_studied TEXT,
  graduation_year INTEGER,
  
  -- Review metadata
  is_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  -- AI analysis
  ai_sentiment_score DECIMAL, -- -1 to 1
  ai_sentiment_label TEXT, -- 'positive', 'negative', 'neutral'
  ai_extracted_topics TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(college_id, user_id) -- One review per user per college
);

-- College administrators table
CREATE TABLE public.college_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'editor', 'viewer'
  department TEXT,
  designation TEXT,
  
  -- Permissions
  can_edit_college_info BOOLEAN DEFAULT false,
  can_manage_courses BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_admissions BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(college_id, user_id)
);

-- Student applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.college_courses(id) ON DELETE CASCADE,
  
  -- Application details
  application_number TEXT UNIQUE,
  application_status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'
  application_date DATE,
  submission_date TIMESTAMP WITH TIME ZONE,
  
  -- Student information
  personal_info JSONB, -- name, dob, contact, address, etc.
  academic_info JSONB, -- previous education details
  entrance_exam_scores JSONB, -- JEE, NEET, CAT scores
  documents JSONB, -- uploaded document URLs
  
  -- Preferences
  course_preferences TEXT[], -- preferred specializations
  campus_preferences TEXT[], -- if multiple campuses
  
  -- Application tracking
  last_updated_by UUID REFERENCES auth.users(id),
  status_history JSONB, -- track status changes with timestamps
  admin_notes TEXT,
  
  -- Deadlines and reminders
  application_deadline DATE,
  document_deadline DATE,
  fee_deadline DATE,
  
  -- AI assistance
  ai_completion_score DECIMAL, -- how complete is the application
  ai_suggestions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SOP (Statement of Purpose) drafts table
CREATE TABLE public.sop_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.college_courses(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'sop', -- 'sop', 'lor', 'personal_statement', 'motivation_letter'
  
  -- AI assistance
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  ai_feedback TEXT,
  ai_score DECIMAL, -- quality score from 1-10
  ai_suggestions TEXT[],
  
  -- Version control
  version INTEGER DEFAULT 1,
  is_final BOOLEAN DEFAULT false,
  parent_draft_id UUID REFERENCES public.sop_drafts(id),
  
  -- Usage tracking
  word_count INTEGER,
  character_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student-college interactions table
CREATE TABLE public.student_college_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  interaction_type TEXT NOT NULL, -- 'view', 'bookmark', 'inquiry', 'brochure_download', 'apply'
  metadata JSONB, -- additional data like page viewed, time spent, etc.
  
  -- For inquiries
  inquiry_subject TEXT,
  inquiry_message TEXT,
  inquiry_status TEXT, -- 'sent', 'replied', 'resolved'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- College events table
CREATE TABLE public.college_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'admission', 'webinar', 'open_house', 'fest', 'seminar', 'workshop'
  description TEXT,
  
  -- Event details
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT false,
  venue TEXT,
  registration_url TEXT,
  
  -- Capacity and registration
  max_participants INTEGER,
  current_registrations INTEGER DEFAULT 0,
  registration_fee DECIMAL DEFAULT 0,
  
  -- Event media
  poster_url TEXT,
  brochure_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- College media gallery table
CREATE TABLE public.college_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  media_type TEXT NOT NULL, -- 'image', 'video', 'virtual_tour'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  category TEXT, -- 'campus', 'facilities', 'events', 'labs', 'hostel', 'library'
  
  -- Media metadata
  file_size BIGINT,
  duration INTEGER, -- for videos in seconds
  resolution TEXT,
  
  -- Display settings
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  uploaded_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- College bookmarks/saved colleges table
CREATE TABLE public.college_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, college_id)
);

-- Create indexes for better performance
CREATE INDEX idx_colleges_city ON public.colleges(city);
CREATE INDEX idx_colleges_state ON public.colleges(state);
CREATE INDEX idx_colleges_college_type ON public.colleges(college_type);
CREATE INDEX idx_colleges_verification_status ON public.colleges(verification_status);
CREATE INDEX idx_colleges_featured ON public.colleges(featured);
CREATE INDEX idx_colleges_ranking_national ON public.colleges(ranking_national);

CREATE INDEX idx_college_courses_college_id ON public.college_courses(college_id);
CREATE INDEX idx_college_courses_degree_type ON public.college_courses(degree_type);
CREATE INDEX idx_college_courses_discipline ON public.college_courses(discipline);

CREATE INDEX idx_college_reviews_college_id ON public.college_reviews(college_id);
CREATE INDEX idx_college_reviews_user_id ON public.college_reviews(user_id);
CREATE INDEX idx_college_reviews_overall_rating ON public.college_reviews(overall_rating);

CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_college_id ON public.applications(college_id);
CREATE INDEX idx_applications_status ON public.applications(application_status);

CREATE INDEX idx_student_college_interactions_user_id ON public.student_college_interactions(user_id);
CREATE INDEX idx_student_college_interactions_college_id ON public.student_college_interactions(college_id);
CREATE INDEX idx_student_college_interactions_type ON public.student_college_interactions(interaction_type);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_courses_updated_at
  BEFORE UPDATE ON public.college_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_reviews_updated_at
  BEFORE UPDATE ON public.college_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_admins_updated_at
  BEFORE UPDATE ON public.college_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sop_drafts_updated_at
  BEFORE UPDATE ON public.sop_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_events_updated_at
  BEFORE UPDATE ON public.college_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_media_updated_at
  BEFORE UPDATE ON public.college_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique slugs for colleges
CREATE OR REPLACE FUNCTION public.generate_college_slug(college_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(college_name), 
        '[^a-zA-Z0-9\s-]', '', 'g'
      ), 
      '\s+', '-', 'g'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_unique_college_slug(base_slug text, college_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  final_slug TEXT := base_slug;
  counter INTEGER := 1;
BEGIN
  WHILE EXISTS (
    SELECT 1 FROM public.colleges 
    WHERE slug = final_slug 
    AND (college_id IS NULL OR id != college_id)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_college_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name AND NEW.slug = OLD.slug) THEN
    NEW.slug := public.ensure_unique_college_slug(
      public.generate_college_slug(NEW.name),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_college_slug_trigger
  BEFORE INSERT OR UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.set_college_slug();

-- Auto-generate application numbers
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := 'APP' || TO_CHAR(now(), 'YYYY') || '-' || 
                             LPAD(nextval('application_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

CREATE TRIGGER generate_application_number_trigger
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_application_number();

-- Enable Row Level Security
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_college_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for colleges table
CREATE POLICY "Anyone can view active colleges" ON public.colleges
  FOR SELECT USING (is_active = true);

CREATE POLICY "College admins can manage their colleges" ON public.colleges
  FOR ALL USING (
    id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create colleges" ON public.colleges
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policies for college_courses table
CREATE POLICY "Anyone can view active courses" ON public.college_courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "College admins can manage courses" ON public.college_courses
  FOR ALL USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND can_manage_courses = true AND is_active = true
    )
  );

-- RLS Policies for college_reviews table
CREATE POLICY "Anyone can view approved reviews" ON public.college_reviews
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can manage their own reviews" ON public.college_reviews
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for college_admins table
CREATE POLICY "College admins can view their college admin info" ON public.college_admins
  FOR SELECT USING (
    user_id = auth.uid() OR 
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "Super admins can manage college admins" ON public.college_admins
  FOR ALL USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

-- RLS Policies for applications table
CREATE POLICY "Students can manage their own applications" ON public.applications
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "College admins can view applications to their college" ON public.applications
  FOR SELECT USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND can_manage_admissions = true AND is_active = true
    )
  );

-- RLS Policies for sop_drafts table
CREATE POLICY "Users can manage their own SOP drafts" ON public.sop_drafts
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for student_college_interactions table
CREATE POLICY "Users can manage their own interactions" ON public.student_college_interactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "College admins can view interactions with their college" ON public.student_college_interactions
  FOR SELECT USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND can_view_analytics = true AND is_active = true
    )
  );

-- RLS Policies for college_events table
CREATE POLICY "Anyone can view active college events" ON public.college_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "College admins can manage their college events" ON public.college_events
  FOR ALL USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for college_media table
CREATE POLICY "Anyone can view college media" ON public.college_media
  FOR SELECT USING (true);

CREATE POLICY "College admins can manage their college media" ON public.college_media
  FOR ALL USING (
    college_id IN (
      SELECT college_id FROM public.college_admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for college_bookmarks table
CREATE POLICY "Users can manage their own bookmarks" ON public.college_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Insert some sample data
INSERT INTO public.colleges (
  name, description, city, state, college_type, established_year,
  average_fees_per_year, placement_percentage, is_verified, featured
) VALUES 
(
  'Indian Institute of Technology Delhi',
  'Premier engineering institute known for excellence in technology and research.',
  'New Delhi', 'Delhi', 'government', 1961,
  200000, 95.5, true, true
),
(
  'Delhi University - St. Stephens College',
  'Prestigious liberal arts college affiliated with University of Delhi.',
  'New Delhi', 'Delhi', 'government', 1881,
  50000, 90.2, true, true
),
(
  'Indian Institute of Management Ahmedabad',
  'Top management institute offering world-class MBA programs.',
  'Ahmedabad', 'Gujarat', 'autonomous', 1961,
  2500000, 98.8, true, true
);

-- Add some sample courses
INSERT INTO public.college_courses (
  college_id, course_name, degree_type, discipline, duration_years,
  total_fees, eligibility_criteria, entrance_exams
) 
SELECT 
  c.id,
  'Bachelor of Technology - Computer Science',
  'undergraduate',
  'engineering',
  4,
  800000,
  'Class 12th with Physics, Chemistry, Mathematics',
  ARRAY['JEE Main', 'JEE Advanced']
FROM public.colleges c 
WHERE c.name LIKE '%IIT Delhi%';
