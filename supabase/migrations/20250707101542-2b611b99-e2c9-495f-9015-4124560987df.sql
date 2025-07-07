-- Create normalized resume data tables as specified
CREATE TABLE IF NOT EXISTS public.users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  professional_summary text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title text NOT NULL,
  company_name text NOT NULL,
  location text,
  start_date text,
  end_date text,
  responsibilities text[],
  key_achievements text[],
  technologies_used text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  location text,
  start_date text,
  end_date text,
  gpa text,
  honors text,
  relevant_coursework text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technical_skills text[],
  programming_languages text[],
  tools_software text[],
  soft_skills text[],
  languages_spoken text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text,
  technologies_used text[],
  start_date text,
  end_date text,
  project_url text,
  github_url text,
  key_achievements text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certification_name text NOT NULL,
  issuing_organization text NOT NULL,
  issue_date text,
  expiry_date text,
  credential_id text,
  credential_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  award_name text NOT NULL,
  issuing_organization text NOT NULL,
  date_received text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.volunteer_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization text NOT NULL,
  role text NOT NULL,
  start_date text,
  end_date text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  publisher text,
  publication_date text,
  url text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest_list text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_name text NOT NULL,
  title text,
  company text,
  email text,
  phone text,
  relationship text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resume_upload_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_size integer,
  extraction_status text DEFAULT 'processing',
  confidence_score numeric,
  processing_time_ms integer,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_upload_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own profile data" ON public.users_profile
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own work experience" ON public.work_experience  
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education" ON public.education
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON public.skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own certifications" ON public.certifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own awards" ON public.awards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own volunteer experience" ON public.volunteer_experience
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own publications" ON public.publications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests" ON public.interests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own references" ON public.references
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own upload logs" ON public.resume_upload_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert upload logs" ON public.resume_upload_logs
  FOR INSERT WITH CHECK (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_profile_updated_at 
  BEFORE UPDATE ON public.users_profile 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at 
  BEFORE UPDATE ON public.work_experience 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_updated_at 
  BEFORE UPDATE ON public.education 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at 
  BEFORE UPDATE ON public.skills 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at 
  BEFORE UPDATE ON public.certifications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_awards_updated_at 
  BEFORE UPDATE ON public.awards 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volunteer_experience_updated_at 
  BEFORE UPDATE ON public.volunteer_experience 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at 
  BEFORE UPDATE ON public.publications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interests_updated_at 
  BEFORE UPDATE ON public.interests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_references_updated_at 
  BEFORE UPDATE ON public.references 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();