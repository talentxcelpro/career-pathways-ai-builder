
-- Create tables for tool usage tracking and results storage

-- Table to track tool usage and analytics
CREATE TABLE public.tool_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tool_name TEXT NOT NULL,
  session_data JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for saved tool results
CREATE TABLE public.saved_tool_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tool_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user tool preferences
CREATE TABLE public.user_tool_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for salary data and market insights
CREATE TABLE public.salary_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_title TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT,
  experience_level TEXT,
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  currency TEXT DEFAULT 'USD',
  data_source TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for interview questions and feedback
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_type TEXT NOT NULL, -- 'mock', 'practice', 'feedback'
  job_role TEXT,
  questions JSONB,
  responses JSONB,
  ai_feedback JSONB,
  score INTEGER,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tool_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_usage
CREATE POLICY "Users can view their own tool usage" 
  ON public.tool_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage" 
  ON public.tool_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool usage" 
  ON public.tool_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for saved_tool_results
CREATE POLICY "Users can view their own saved results" 
  ON public.saved_tool_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved results" 
  ON public.saved_tool_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved results" 
  ON public.saved_tool_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved results" 
  ON public.saved_tool_results 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_tool_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_tool_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_tool_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_tool_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for salary_data (public read access)
CREATE POLICY "Anyone can view salary data" 
  ON public.salary_data 
  FOR SELECT 
  TO authenticated;

-- RLS Policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" 
  ON public.interview_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview sessions" 
  ON public.interview_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
  ON public.interview_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for uploaded files (resumes, documents)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tool-uploads', 'tool-uploads', false);

-- Storage policies for tool uploads
CREATE POLICY "Users can upload their own files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'tool-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'tool-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'tool-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'tool-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert some sample salary data
INSERT INTO public.salary_data (job_title, location, industry, experience_level, salary_range_min, salary_range_max) VALUES
('Software Engineer', 'San Francisco, CA', 'Technology', 'Entry', 80000, 120000),
('Software Engineer', 'San Francisco, CA', 'Technology', 'Mid', 120000, 180000),
('Software Engineer', 'San Francisco, CA', 'Technology', 'Senior', 180000, 280000),
('Product Manager', 'New York, NY', 'Technology', 'Mid', 100000, 150000),
('Data Scientist', 'Seattle, WA', 'Technology', 'Senior', 140000, 200000),
('UX Designer', 'Austin, TX', 'Technology', 'Mid', 75000, 110000),
('DevOps Engineer', 'Remote', 'Technology', 'Senior', 130000, 190000);
