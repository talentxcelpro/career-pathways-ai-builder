
-- Create comprehensive database schema for Talenxcel platform (fixed version)

-- User profiles table (extended user data beyond auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  title TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  about TEXT,
  profile_picture_url TEXT,
  cover_image_url TEXT,
  skills TEXT[],
  experience_years INTEGER DEFAULT 0,
  industry TEXT,
  current_company TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  is_profile_public BOOLEAN DEFAULT true,
  looking_for_job BOOLEAN DEFAULT false,
  open_to_remote BOOLEAN DEFAULT true,
  preferred_salary_min INTEGER,
  preferred_salary_max INTEGER,
  preferred_locations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  size_range TEXT,
  location TEXT,
  founded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  salary_min INTEGER,
  salary_max INTEGER,
  skills_required TEXT[],
  benefits TEXT[],
  is_active BOOLEAN DEFAULT true,
  posted_by UUID REFERENCES auth.users(id),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interviewing', 'rejected', 'accepted')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  duration_hours INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  skills_taught TEXT[],
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  video_url TEXT,
  curriculum JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User course enrollments
CREATE TABLE public.user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

-- Learning paths
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_weeks INTEGER,
  course_ids UUID[],
  skills_gained TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career goals and mapping (fixed column name)
CREATE TABLE public.career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_position TEXT,
  target_role TEXT,
  target_company TEXT,
  timeline_months INTEGER,
  skills_needed TEXT[],
  milestones JSONB,
  progress_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional connections/network
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- Posts/feed content
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll', 'article')),
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post reactions
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments on posts
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes storage
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  template_id TEXT,
  is_primary BOOLEAN DEFAULT false,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover letters storage
CREATE TABLE public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view public profiles" ON public.profiles FOR SELECT USING (is_profile_public = true OR auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Companies can manage their jobs" ON public.jobs FOR ALL USING (auth.uid() = posted_by);

-- RLS Policies for job applications
CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for saved jobs
CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Instructors can manage own courses" ON public.courses FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for user courses
CREATE POLICY "Users can manage own enrollments" ON public.user_courses FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for learning paths
CREATE POLICY "Anyone can view learning paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Creators can manage own paths" ON public.learning_paths FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for career goals
CREATE POLICY "Users can manage own career goals" ON public.career_goals FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for connections
CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their connections" ON public.connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- RLS Policies for posts
CREATE POLICY "Users can view public posts" ON public.posts FOR SELECT USING (is_public = true OR auth.uid() = author_id);
CREATE POLICY "Users can create own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for post reactions
CREATE POLICY "Users can view all reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.post_reactions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for post comments
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND (is_public = true OR author_id = auth.uid()))
);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON public.post_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for resumes
CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cover letters
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters FOR ALL USING (auth.uid() = user_id);

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample companies
INSERT INTO public.companies (id, name, description, website, industry, size_range, location) VALUES
  (gen_random_uuid(), 'TechCorp Inc.', 'Leading technology solutions provider', 'https://techcorp.com', 'Technology', '1000-5000', 'San Francisco, CA'),
  (gen_random_uuid(), 'InnovateLab', 'Innovative product development company', 'https://innovatelab.com', 'Product Development', '100-500', 'Austin, TX'),
  (gen_random_uuid(), 'DesignStudio', 'Creative design and branding agency', 'https://designstudio.com', 'Design', '50-200', 'New York, NY'),
  (gen_random_uuid(), 'DataDriven Analytics', 'Big data and analytics solutions', 'https://datadriven.com', 'Analytics', '200-1000', 'Seattle, WA'),
  (gen_random_uuid(), 'GreenTech Solutions', 'Sustainable technology innovations', 'https://greentech.com', 'Clean Technology', '100-500', 'Portland, OR');
