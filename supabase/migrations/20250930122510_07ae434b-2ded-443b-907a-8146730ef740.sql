-- Create missing core tables that the application expects

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  size_range TEXT,
  location TEXT,
  founded_year INTEGER,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_team_members table for managing team access
CREATE TABLE public.company_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Create cv_files table for CV management
CREATE TABLE public.cv_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  parsing_status TEXT DEFAULT 'pending',
  parsing_results JSONB DEFAULT '{}',
  parsed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  module TEXT,
  related_id UUID,
  link TEXT,
  priority TEXT DEFAULT 'medium',
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Company admins can update companies" ON public.companies FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM company_team_members 
    WHERE company_id = companies.id AND role IN ('owner', 'admin') AND is_active = true
  )
);

-- Create RLS policies for company_team_members
CREATE POLICY "Company members can view team" ON public.company_team_members FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM company_team_members ctm2 
    WHERE ctm2.company_id = company_team_members.company_id AND ctm2.is_active = true
  )
);
CREATE POLICY "Company owners can manage team" ON public.company_team_members FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM company_team_members ctm2 
    WHERE ctm2.company_id = company_team_members.company_id AND ctm2.role = 'owner' AND ctm2.is_active = true
  )
);

-- Create RLS policies for cv_files
CREATE POLICY "Users can view their own CV files" ON public.cv_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload CV files" ON public.cv_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their CV files" ON public.cv_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Employers can view CV files through applications" ON public.cv_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_applications ja 
    JOIN jobs j ON j.id = ja.job_id 
    WHERE ja.user_id = cv_files.user_id AND j.posted_by = auth.uid()
  )
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_industry ON public.companies(industry);
CREATE INDEX idx_company_team_members_company_id ON public.company_team_members(company_id);
CREATE INDEX idx_company_team_members_user_id ON public.company_team_members(user_id);
CREATE INDEX idx_cv_files_user_id ON public.cv_files(user_id);
CREATE INDEX idx_cv_files_parsing_status ON public.cv_files(parsing_status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_team_members_updated_at BEFORE UPDATE ON public.company_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cv_files_updated_at BEFORE UPDATE ON public.cv_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();