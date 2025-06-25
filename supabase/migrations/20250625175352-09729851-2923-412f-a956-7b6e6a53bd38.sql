
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('job_seeker', 'employer', 'admin');

-- Create enum for team member roles within companies
CREATE TYPE public.team_role AS ENUM ('admin', 'recruiter', 'hr_manager', 'viewer');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected');

-- Create enum for interview status
CREATE TYPE public.interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role public.user_role DEFAULT 'job_seeker';

-- Create company_profiles table (separate from companies for employer-specific data)
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan TEXT DEFAULT 'free',
  jobs_posted_count INTEGER DEFAULT 0,
  active_jobs_count INTEGER DEFAULT 0,
  total_applications_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id)
);

-- Create company_team_members table for multi-user access
CREATE TABLE public.company_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.team_role DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  UNIQUE(company_id, user_id)
);

-- Create candidate_notes table for recruiter notes
CREATE TABLE public.candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create interview_schedules table (extending existing if needed)
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  scheduled_by UUID REFERENCES auth.users(id),
  interview_type TEXT DEFAULT 'video',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  status public.interview_status DEFAULT 'scheduled',
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_analytics table for tracking job performance
CREATE TABLE public.job_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  source_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, date)
);

-- Create candidate_communications table for tracking outreach
CREATE TABLE public.candidate_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  communication_type TEXT DEFAULT 'email', -- email, call, message
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'sent', -- sent, delivered, opened, replied
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_templates table for saved employer messages
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT DEFAULT 'general', -- rejection, interview_invite, offer, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update job_applications table with enhanced status tracking
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS status public.application_status DEFAULT 'applied',
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS ai_match_score NUMERIC(3,2) CHECK (ai_match_score >= 0 AND ai_match_score <= 1),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_owner ON public.company_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_team_members_company ON public.company_team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_team_members_user ON public.company_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_job ON public.candidate_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate ON public.candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_date ON public.job_analytics(job_id, date);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_assigned ON public.job_applications(assigned_to);

-- Enable RLS on new tables
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_profiles
CREATE POLICY "Company owners can manage their company profile"
  ON public.company_profiles
  FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Team members can view company profile"
  ON public.company_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members 
      WHERE company_id = company_profiles.company_id 
      AND user_id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS Policies for company_team_members
CREATE POLICY "Company admins can manage team members"
  ON public.company_team_members
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_profiles WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM public.company_team_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- RLS Policies for candidate_notes
CREATE POLICY "Team members can manage notes for their company jobs"
  ON public.candidate_notes
  FOR ALL
  USING (
    job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

-- RLS Policies for interviews
CREATE POLICY "Team members can manage interviews for their company jobs"
  ON public.interviews
  FOR ALL
  USING (
    application_id IN (
      SELECT ja.id FROM public.job_applications ja
      JOIN public.jobs j ON ja.job_id = j.id
      JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

-- RLS Policies for job_analytics
CREATE POLICY "Team members can view analytics for their company jobs"
  ON public.job_analytics
  FOR SELECT
  USING (
    job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

-- RLS Policies for candidate_communications
CREATE POLICY "Team members can manage communications for their company jobs"
  ON public.candidate_communications
  FOR ALL
  USING (
    job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

-- RLS Policies for email_templates
CREATE POLICY "Team members can manage email templates for their company"
  ON public.email_templates
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_team_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Update existing jobs RLS to include team member access
DROP POLICY IF EXISTS "Users can view published jobs" ON public.jobs;
CREATE POLICY "Users can view published jobs"
  ON public.jobs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Company team members can manage their jobs"
  ON public.jobs
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_team_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
